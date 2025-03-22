 {/* {/* <div className="history-section">
        <h2>Allocation History</h2>
        {allocationHistory.length === 0 ? (
          <p className="no-history">No allocation history found.</p>
        ) : ( */}
        //   <div className="history-table-container">
        //     <table className="history-table">
        //       <thead>
        //         <tr>
        //           <th>Date</th>
        //           <th>Resources</th>
        //           <th>Total</th>
        //           <th>Admin</th>
        //         </tr>
        //       </thead>
        //       <tbody>
        //         {allocationHistory.map((record) => ( */}
        //           <tr key={record.id}>
        //             <td>{formatDate(record.createdAt)}</td>
        //             <td>
        //               <ul className="resource-list">
        //                 {record.allocations.map((item, i) => (
        //                   <li key={i}>
        //                     {item.resourceType.name}: {item.quantity} {item.unit} 
        //                     ({formatCurrency(item.cost * item.quantity)})
        //                   </li>
        //                 ))}
        //               </ul>
        //             </td>
        //             <td>{formatCurrency(record.totalCost)}</td>
        //             <td>{record.admin.name}</td>
        //           </tr>
        //         ))}
        //       </tbody>
        //     </table>
        //   </div>
    //     )}
    //   </div>