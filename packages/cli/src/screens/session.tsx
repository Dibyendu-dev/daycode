import { useState, useEffect, useMemo } from "react";
import { useParams,useLocation, useNavigate } from "react-router";
import { z} from "zod";
import prettyMs from "pretty-ms";
import { useKeyboard } from "@opentui/react";
import type { InferResponseType } from "hono/client";
import { DEFAULT_CHAT_MODEL_ID, type SupportedChatModelId } from "@daycode/shared";
import { SessionShell } from "../components/session-shell";
import { UserMessage, BotMessage, ErrorMessage } from "../components/messages";
import { useToast } from "../components/providers/toast";
import { apiClient } from "../lib/api-client";
import { getErrorMessage } from "../lib/http-errors";
import { useChat } from "../hooks/useChat";
import type { Message, ClientMessagePart } from "../hooks/useChat";
import type { TypeOf } from "zod/v3";
import { MessageStatus } from "@daycode/database/enums";
import { useKeyboardLayer } from "../components/providers/keyboard-layer";



type SessionData = InferResponseType<(typeof apiClient.sessions)[":id"]["$get"], 200>;

const sessionLocationSchema = z.object({
    session: z.custom<SessionData>((val)=> val != null && typeof val === "object" && "id" in val)
})

function mapDBMessages(dbmessages: SessionData["messages"]):Message[] {
    return dbmessages.map((msg):Message => {
        if (msg.role === "USER") {
            return {id: msg.id, role: "user", 
                content: msg.content, 
                model: msg.model as SupportedChatModelId || DEFAULT_CHAT_MODEL_ID,
                 mode:msg.mode 
                } ;
        }
        if (msg.role === "ERROR") {
            return {id: msg.id, role: "error", content: msg.content} ;
        }
        return {id: msg.id, 
            role: "assistant",
             content: msg.content,
             mode: msg.mode,
             model: msg.model as SupportedChatModelId || DEFAULT_CHAT_MODEL_ID,
            parts: [{ type: "text", text: msg.content }],
            ...(msg.duration != null ? {duration: prettyMs(msg.duration * 1000 )} : {}),
            interrupted: msg.status === MessageStatus.INTERRUPTED,
            };
    });
}

function ChatMessage({msg}: {msg: Message}) {
    if (msg.role === "user") {
        return <UserMessage message={msg.content} />
    }
     if (msg.role === "error") {
        return <ErrorMessage message={msg.content} />
    }    
     return <BotMessage 
     parts={msg.parts}
     model = {msg.model}
     duration={msg.duration}
     mode={msg.mode}
     streaming={false}
     interrupted={msg.interrupted}
     />
    
}

function SessionChat({session}: {session: SessionData}){
    const [initialMessages] = useState(()=> mapDBMessages(session.messages));
    const {messages, streamingState, submit, abort, interrupt } = useChat( session.id, initialMessages);
    const { isTopLayer } = useKeyboardLayer();

    useEffect(()=>{
        return()=> abort();
    },[])

    useKeyboard((key)=>{
        if(key.name === "escape" && isTopLayer("base") && streamingState.status ==="streaming") {
            key.preventDefault()
            interrupt()
        }
    })

    return(
        <SessionShell
        onSubmit={(text)=> submit({userText: text, mode: "BUILD", model: DEFAULT_CHAT_MODEL_ID})}
        loading={streamingState.status === "streaming"}
        interuptible={streamingState.status === "streaming"}
        >
            {messages.map((msg)=> (
                <ChatMessage key={msg.id} msg={msg} />
            ))}

            {streamingState.status === "streaming" &&  session.messages.length > 0 &&(
                <BotMessage
                parts={streamingState.parts}
                model = {streamingState.model}
                mode={streamingState.mode}
                streaming={true}
                />
            )}
        </SessionShell>
    )

}



export function Sessions() {
    const {id} = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const toast = useToast();

    const prefetched = useMemo(()=> {
        const parsed = sessionLocationSchema.safeParse(location.state);
        return parsed.success ? parsed.data.session : null;
    },[location.state]);

    const [session,setSession] = useState<SessionData | null>(prefetched);
    useEffect(()=>{
        //skip fetch if session is passed via location state
        if(prefetched) return;
        
        setSession(null);
        
        if(!id) return;
        let ignore = false;
        const fetchSession = async () => {
            try {
                const res = await apiClient.sessions[":id"].$get({
                    param: {id}
                }) 
                if (ignore) return;
                if(!res.ok) throw new Error( await getErrorMessage(res))
                const resolved = await res.json()
                setSession(resolved)
            } catch (error) {
                if (ignore) return;
                toast.show({
                variant: "error",
                message: error instanceof Error ? error.message : " failed to create session"
                })
             navigate("/", {replace: true})
            }
        }
        fetchSession()
        return () => {
        ignore= true
      }
    },[id,prefetched,toast,navigate])

    if(!session){
        return <SessionShell onSubmit={()=>{}} inputDisabled loading />
    }

    return <SessionChat key={session.id} session={session} />
}