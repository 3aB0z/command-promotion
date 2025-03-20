import { Icon, Toast } from "@ui5/webcomponents-react";

export default function Popup({ notification, setNotification }) {
  return (
    <>
      <Toast
        onClose={function Js() {
          setNotification((prv) => ({ ...prv, visible: false }));
        }}
        open={notification.visible}
        placement="BottomEnd"
        duration={4000}
        className={`${
          notification.sucess
            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
            : "bg-rose-100 text-rose-800 border-rose-300"
        } border px-3 py-2`}
      >
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() =>
              setNotification((prv) => ({ ...prv, visible: false }))
            }
            className="bg-transparent p-0 group min-w-[24px] min-h-[24px] w-6 h-6"
          >
            <Icon
              name={notification.sucess ? "accept" : "decline"}
              className={`${
                notification.sucess
                  ? "text-emerald-500 group-hover:bg-emerald-200 group-hover:text-emerald-700"
                  : "text-rose-600 group-hover:bg-rose-200 group-hover:text-rose-700"
              } w-full h-full p-0.5 rounded transition-colors`}
            />
          </button>
          <span className="text-start">{notification.message}</span>
        </div>
      </Toast>
    </>
  );
}
