import { useParams } from "react-router";
import { SessionShell } from "../components/session-shell";

export function Sessions() {
    const {id} = useParams()

    return(
        <SessionShell onSubmit={()=>{}} inputDisabled loading/>
    )
}