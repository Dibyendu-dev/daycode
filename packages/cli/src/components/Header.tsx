export function Header(){
    return(
        <box justifyContent="center" alignItems="center">
            <box flexDirection="row" justifyContent="center" gap={0.5} alignItems="center">   
                <ascii-font font="slick" text="day" color="grey" />
                <ascii-font font="slick" text="code" />
            </box>
        </box>
    )
}