// // import React, { useEffect } from 'react';
// import axios from 'axios';
// // import useNotifications from '@/hooks/useNotifications';
// import { Link } from 'react-router-dom';

// export default function NotificationsPage() {
//   // const { notifications, fetchNotifications } = useNotifications();

//   const markAsRead = async (id) => {
//     await axios.patch(`/api/notifications/${id}/read`);
//     fetchNotifications();
//   };

//   return (
//     <div className="max-w-2xl mx-auto">
//       <h2 className="text-2xl font-semibold mb-4">🔔 Notifications</h2>
//       <ul className="space-y-3">
//         {notifications.map((n) => (
//           <li
//             key={n._id}
//             className={`p-3 border rounded ${n.isRead ? 'bg-white' : 'bg-yellow-100'}`}
//           >
//             <div className="flex justify-between items-center">
//               <div>
//                 <strong>{n.title}</strong>
//                 <p className="text-sm">{n.message}</p>
//               </div>
//               <button
//                 onClick={() => markAsRead(n._id)}
//                 className="text-xs text-blue-500"
//               >
//                 Mark as read
//               </button>
//             </div>
//             {n.link && (
//               <Link to={n.link} className="text-sm text-blue-600 underline">
//                 View
//               </Link>
//             )}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }
