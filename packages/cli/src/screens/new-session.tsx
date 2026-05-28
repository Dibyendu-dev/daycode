import { useEffect } from "react";
import { replace, useLocation, useNavigate } from "react-router";
import { SessionShell } from "../components/session-shell";
import { BotMessage, ErrorMessage, UserMessage } from "../components/messages";



export function NewSession(){
    const navigate = useNavigate()
    const location = useLocation()
    

    const state = location.state as { message?: string} | null;

    useEffect(()=>{
        if (!state?.message) {
            navigate("/", {replace: true})
        }
    },[state,navigate])

    if(!state?.message) return null;
    return(
       <SessionShell
         onSubmit={()=> {console.log("hello")}}
         inputDisabled
         loading
         childern={
           <>
             <UserMessage message={state.message}/>
             <BotMessage 
               content="This is sample bot response"
               model="opus-4.6"
             />
             <ErrorMessage message="this is sample error message"/>
           </>
         }
       />
    )
}