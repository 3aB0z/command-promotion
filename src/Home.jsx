import { Icon } from "@ui5/webcomponents-react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <div className="flex justify-center items-center w-full gap-10 flex-wrap py-4 px-4">
        <Link
          to={"/clients"}
          className="min-w-[250px] h-40 hover:bg-slate-50 flex items-center justify-center gap-2 border shadow-md shadow-slate-200 hover:shadow-slate-300 transition-colors rounded-md"
        >
          <Icon name="employee" className="w-6 h-6 text-blue-950" />
          <span className="text-xl text-blue-500">Clients</span>
        </Link>
        <Link
          to={"/addClient"}
          className="min-w-[250px] h-40 hover:bg-slate-50 flex items-center justify-center gap-2 border shadow-md shadow-slate-200 hover:shadow-slate-300 transition-colors rounded-md"
        >
          <Icon name="add-employee" className="w-6 h-6 text-blue-950" />
          <span className="text-xl text-blue-500">Add Client</span>
        </Link>
        <Link
          to={"/createOrder"}
          className="min-w-[250px] h-40 hover:bg-slate-50 flex items-center justify-center gap-2 border shadow-md shadow-slate-200 hover:shadow-slate-300 transition-colors rounded-md"
        >
          <Icon name="cart-4" className="w-6 h-6 text-blue-950" />
          <span className="text-xl text-blue-500">Create Order</span>
        </Link>
      </div>
    </>
  );
}
