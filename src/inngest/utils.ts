import {Sandbox} from "@e2b/code-interpreter";
import { AgentResult } from "@inngest/agent-kit";

type TextMessage = {
  role: "assistant";
  content: string | Array<{ text: string }>;
};

export async function getsandbox(sandboxID:string){
  const sandbox=await Sandbox.connect(sandboxID);
  return sandbox;
}

export function lastAssistantTextMessageContext(result: AgentResult){
    const lastAssistantTextMessageIndex= result.output.findLastIndex(
        (message)=>message.role ==="assistant",

    );
    const message =result.output[lastAssistantTextMessageIndex] as TextMessage | undefined;
    return message?.content
    ? typeof message.content ==="string"
    ? message.content
    :message.content.map((c: { text: string })=>c.text).join(""):
    undefined;
} 