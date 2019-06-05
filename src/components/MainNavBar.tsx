import * as React from "react";
import logo from "../assets/polispay-white.svg";

import {Navbar, NavbarBrand} from "reactstrap";

export interface MainNavBarProps {
}
export interface MainNavBarState {
}
class MainNavBar extends React.Component<MainNavBarProps, MainNavBarState> {
    render() {
        return (
            <Navbar className="navbar-color" expand="md">
                <NavbarBrand href="https://polispay.com" target="_blank" rel="noopener noreferrer"><img alt="PolisPay"  width="100px" src={logo}/></NavbarBrand>
            </Navbar>
        );
    }
}
export default MainNavBar;
