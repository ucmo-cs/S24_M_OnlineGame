import { Container, Nav, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";

import AuthService from "/app/services/AuthService";

function Options() {
  if (AuthService.isLoggedIn() || AuthService.isGameAuth()) {
    return (
      <>
        <Nav className="flex col-12">
        <img style={{width:"7rem"}} src="/2.png" />
          
          <Link
            to="#"
            onClick={() => AuthService.logout()}
            className="nav-link navbar-brand"
            style={{ marginLeft: "auto", marginTop:"15px"}}
          >
            Logout
          </Link>
        </Nav>
      </>
    );
  } else {
    return (
      <>
        <Nav className="flex justify-between w-[100%] items-center">
          <Link to="/">
            <img style={{ width: "7rem" }} src="/2.png" />
          </Link>
          <div>
            <Link to="/join" className="navbar-brand">
              Sign-up
            </Link>
            <Link to="/login" className="navbar-brand">
              Login
            </Link>
            <Link to="/game/join" className="navbar-brand">
              Join Game
            </Link>
          </div>
        </Nav>
      </>
    );
  }
}
function App() {
  //*!-- FIXME -- to attribute not working, using onclick, please change back to the attribute of to only with proper refresh, #ASK TEACHER!!
  return (
    <>
      <Navbar className={"bg-[#111]"} variant="dark" id="main-navbar">
        <Container>
          <Options />
        </Container>
      </Navbar>
    </>
  );
}

export default App;
