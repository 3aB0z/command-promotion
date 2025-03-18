import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <>
      <nav className="fixed top-0 z-50 w-full h-11 flex justify-center items-center underline from-emerald-300 to-sky-400 bg-gradient-to-r space-x-6">
        <Link to="/" className="text-white hover:text-slate-100">
          Home
        </Link>
        <Link to="/clients" className="text-white hover:text-slate-100">
          Clients
        </Link>
        <Link to="/addClient" className="text-white hover:text-slate-100">
          Create Client
        </Link>
        <Link to="/createOrder" className="text-white hover:text-slate-100">
          Create Order
        </Link>
      </nav>
    </>
  );
}
