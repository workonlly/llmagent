import { openai, createAgent, createTool, createNetwork } from "@inngest/agent-kit";
import { inngest } from "./client";
import { Sandbox } from "@e2b/code-interpreter";
import { getsandbox, lastAssistantTextMessageContext  } from "./utils";
import { z } from "zod";
import { PROMPT } from "../prompt";
import prisma from "../lib/prisma";

export const codeagent = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("ll11mdone");
      return sandbox.sandboxId;
    });

    const summarizer = createAgent({
      name: "summarizer",
      description: "an expert coding agent that can write and edit code",
      system: PROMPT,
      model: openai({
        model: "gpt-4o",
        apiKey: process.env.OPENAI_API_KEY,
      }),
      tools: [
        createTool({
          name: "terminal",
          description: "use the terminal for running commands",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, { step }) => {
            return await step?.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" };

              try {
                const sandbox = await getsandbox(sandboxId);
                const result = await sandbox.commands.run(command, {
                  onStdout: (data: string) => {
                    buffers.stdout += data;
                  },
                  onStderr: (data: string) => {
                    buffers.stderr += data;
                  },
                });
                return result.stdout;
              } catch (e) {
                console.error(
                  `Command failed: ${e} \nstdout:${buffers.stdout}\nstderr:${buffers.stderr}`
                );
                return `Command failed: ${e} \nstdout:${buffers.stdout}\nstderr:${buffers.stderr}`;
              }
            });
          },
        }),

        createTool({
          name: "createOrUpdateFiles",
          description: "create or update files in sandbox",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              })
            ),
          }),
          handler: async ({ files }, { step, network }) => {
            const newFiles = await step?.run("createOrUpdateFiles", async () => {
              try {
                const updatedFiles = network.state.data.files || {};
                const sandbox = await getsandbox(sandboxId);
                for (const file of files) {
                  await sandbox.files.write(file.path, file.content);
                  updatedFiles[file.path] = file.content;
                }
                return updatedFiles;
              } catch (e) {
                return "Error" + e;
              }
            });
            if (typeof newFiles === "object") {
              network.state.data.files = newFiles;
            }
          },
        }),

        createTool({
          name: "readFiles",
          description: "read files from sandbox",
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, { step }) => {
            return await step?.run("readFiles", async () => {
              try {
                const sandbox = await getsandbox(sandboxId);
                const contents = [];
                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push({ path: file, content });
                }
                return JSON.stringify(contents);
              } catch (e) {
                return "Error" + e;
              }
            });
          },
        }),
      ],
      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssistantMessageText = lastAssistantTextMessageContext(result);

          if (lastAssistantMessageText && network) {
            if (lastAssistantMessageText.includes("<task_summary>")) {
              network.state.data.summary = lastAssistantMessageText;
            }
          }

          return result;
        },
      },
    });

    const network = createNetwork({
      name: "coding-agent-network",
      agents: [summarizer],
      maxIter: 15,
      router: async ({ network }) => {
        const summary = network.state.data.summary;
        if (summary) {
          return;
        }
        return summarizer;
      },
    });

    const result= await network.run(event.data.value);
    const isError=!result.state.data.summary ||
    Object.keys(result.state.data.files || {}).length ===0;

    const sandboxURL = await step.run("get-sandbox-url", async () => {
      const sandbox = await getsandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    await step.run("save-result" ,async()=>{
       if(isError){
        return await prisma.message.create({
          data:{
            projectId: event.data.projectId,
            content:" Error: unable to process the request",
            role:"ASSISTANT",
            type:"ERROR",
          }
        })
       }


      return await prisma.message.create({
         data:{
          projectId: event.data.projectId,
          content:result.state.data.summary,
          role:"ASSISTANT",
          type:"RESULT",
          fragment:{
            create:{
            sandboxUrl: sandboxURL,
            title:"Fragment",
            files: result.state.data.files,

            }
          }
         }

      })
    })
    return {url: sandboxURL,
        title:"Fragment",
        files:result.state.data.files,
        summary:result.state.data.summary,
     };
  }
);