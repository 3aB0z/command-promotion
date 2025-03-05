import { Link } from "react-router-dom";

export default function Home({ clients }) {
  return (
    <>
      <div className="w-2/3">
        {clients.length !== 0 ? (
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-700">
                <th>Card Code:</th>
                <th>Card Name:</th>
                <th>Card Type:</th>
                <th>Details:</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => {
                return (
                  <tr key={client.CardCode} className="hover:bg-stone-600">
                    <td>{client.CardCode}</td>
                    <td>{client.CardName}</td>
                    <td>{client.CardType}</td>
                    <td>
                      <Link to={`/clients/${client.CardCode}`}>Details</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <span>Clients table is empty!</span>
        )}
      </div>
    </>
  );
}
