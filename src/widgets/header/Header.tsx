import {Navbar} from "@/widgets/navbar";
import logo from "@/shared/assets/logo.svg"

export const Header = () => {
    return (
        <header>
            <div>
                <img alt="logo" src={logo} />
            </div>
            <Navbar />
        </header>
    )
}