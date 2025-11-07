// 라우터
import { Link } from "react-router-dom";
// css
import "./Menu.scss";
// data
import menus from "../data/menu";

const Menu = ({ isOpen, closeMenu }) => {
  return (
    <div className={`menu ${isOpen ? "open" : ""}`}>
      <h2>Menu</h2>
      <ul>
        {menus.map((menu) => (
          <li key={menu.id}>
            <Link to={`/${menu.path}`} onClick={closeMenu}>{menu.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Menu;
