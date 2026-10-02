import { Avatar, Bar, Button, Icon } from "@ui5/webcomponents-react";
import SAPBusinessOneLogo from "../assets/SAPBusinessOneLogo.png";

export default function Navbar() {
  return (
    <>
      <Bar
        className="bg-primary shadow-none h-12"
        design="Header"
        startContent={
          <span className="flex gap-3">
            <img
              src={SAPBusinessOneLogo}
              alt="SAP Business One Logo"
              width={100}
            />
          </span>
        }
        endContent={
          <span className="flex gap-2">
            <Button title="Open Search" className="hover:bg-slate-300/20">
              <Icon name="search" className="w-5 h-5 text-white" />
            </Button>
            <Button title="Notifications" className="hover:bg-slate-300/20">
              <Icon name="bell" className="w-5 h-5 text-white" />
            </Button>
            <Button title="Profile of User Name">
              <Avatar
                icon="employee"
                shape="Circle"
                size="XS"
                className="bg-sky-500 text-sky-900"
              />
            </Button>
          </span>
        }
      />
    </>
  );
}
