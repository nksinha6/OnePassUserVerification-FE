// import React, { useEffect, useState, useRef } from "react";
// import { Building2, User } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import MobileHeader from "../Components/MobileHeader";
// import { HISTORY_UI } from "../constants/ui";
// import guestService from "../services/guestService";
// import tenantService from "../services/tenantService";

// const CheckinHistory = () => {
//   const navigate = useNavigate();

//   const hasBookingsFetched = useRef(false);

//   const [history, setHistory] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (hasBookingsFetched.current) return;
//     hasBookingsFetched.current = true;
//     const fetchHistory = async () => {
//       try {
//         const phoneCountryCode =
//           sessionStorage.getItem("phoneCountryCode") ||
//           sessionStorage.getItem("visitorPhoneCountryCode") ||
//           "91";

//         const phoneNumber =
//           sessionStorage.getItem("phoneNumber") ||
//           sessionStorage.getItem("visitorPhoneNumber");

//         console.log("Fetching bookings for:", phoneCountryCode, phoneNumber);

//         // ✅ Only fetch bookings
//         const bookings = await guestService.getAllBookings(
//           phoneCountryCode,
//           phoneNumber,
//         );

//         if (!bookings || bookings.length === 0) {
//           setHistory([]);
//           return;
//         }

//         const enrichedBookings = await Promise.all(
//           bookings.map(async (booking) => {
//             try {
//               console.log("Calling tenant API with ID:", booking.tenantId);
//               const tenantResponse = await tenantService.getTenantById(
//                 booking.tenantId,
//               );
//               console.log("Tenant API response:", tenantResponse);
//               console.log("Response tenant ID:", tenantResponse.id);

//               return {
//                 ...booking,
//                 tenantData: tenantResponse || null, // attach full response
//               };
//             } catch (err) {
//               console.error(
//                 `Error fetching tenant for ID ${booking.tenantId}:`,
//                 err,
//               );
//               return {
//                 ...booking,
//                 tenantData: null,
//               };
//             }
//           }),
//         );

//         console.log(enrichedBookings);

//         setHistory(enrichedBookings);
//       } catch (error) {
//         console.error("Error fetching history:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchHistory();
//   }, []);

//   return (
//     <div className="w-full h-dvh bg-white px-4 py-5 flex flex-col overflow-y-auto">
//       <MobileHeader
//         showBack={false}
//         rightComponent={
//           <div
//             onClick={() => navigate("/profile")}
//             className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 active:scale-95 transition-all"
//           >
//             <User size={20} className="text-gray-600" />
//           </div>
//         }
//       />

//       {/* Title */}
//       <h1 className="text-2xl text-brand mb-2">{HISTORY_UI.TITLE}</h1>

//       {/* Description */}
//       <p className="text-sm text-gray-500 mb-6 leading-[20px]">
//         {HISTORY_UI.DESCRIPTION}
//       </p>

//       {/* History List */}
//       {loading ? (
//         <p className="text-sm text-gray-500">Loading...</p>
//       ) : (
//         <div className="space-y-4">
//           {history.map((item) => {
//             const logoSrc = item.tenantData?.logo
//               ? `data:${item.tenantData.logoContentType};base64,${item.tenantData.logo}`
//               : null;

//             const datePart = item.bookingId?.split("-##-")[1];

//             const formatDate = (dateStr) => {
//               if (!dateStr) return "N/A";

//               const [day, month, year, hour, min] = dateStr.split(":");

//               const months = [
//                 "Jan",
//                 "Feb",
//                 "Mar",
//                 "Apr",
//                 "May",
//                 "Jun",
//                 "Jul",
//                 "Aug",
//                 "Sep",
//                 "Oct",
//                 "Nov",
//                 "Dec",
//               ];

//               const monthName = months[parseInt(month, 10) - 1];
//               const shortYear = year.slice(-2);

//               let h = parseInt(hour, 10);
//               const ampm = h >= 12 ? "PM" : "AM";

//               h = h % 12;
//               h = h === 0 ? 12 : h;

//               const formattedHour = h.toString().padStart(2, "0");

//               return `${day} ${monthName} ${shortYear}, ${formattedHour}:${min} ${ampm}`;
//             };

//             return (
//               <div
//                 key={item.bookingId}
//                 className="flex items-center justify-between border-b border-gray-100 pb-4"
//               >
//                 <div className="flex items-center gap-3">
//                   {/* ✅ Default icon only */}
//                   <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
//                     {logoSrc ? (
//                       <img
//                         src={logoSrc}
//                         alt="tenant logo"
//                         className="w-full h-full object-cover"
//                       />
//                     ) : (
//                       <Building2 size={18} className="text-brand" />
//                     )}
//                   </div>

//                   <div>
//                     <h4 className="text-sm font-semibold">
//                       {item.propertyName || "Unknown Location"}
//                     </h4>

//                     <p className="text-xs text-gray-500">
//                       {item.ota || "Visit"} • {formatDate(datePart)}
//                     </p>
//                   </div>
//                 </div>

//                 <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-green-100 text-green-600">
//                   COMPLETED
//                 </span>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       <div className="flex-1" />
//     </div>
//   );
// };

// export default CheckinHistory;

// -------

import React, { useEffect, useState, useRef } from "react";
import { Building2, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "../Components/MobileHeader";
import { HISTORY_UI } from "../constants/ui";
import guestService from "../services/guestService";
import tenantService from "../services/tenantService";

const CheckinHistory = () => {
  const navigate = useNavigate();

  const hasBookingsFetched = useRef(false);

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hasBookingsFetched.current) return;
    hasBookingsFetched.current = true;
    const fetchHistory = async () => {
      try {
        const phoneCountryCode =
          sessionStorage.getItem("phoneCountryCode") ||
          sessionStorage.getItem("visitorPhoneCountryCode") ||
          "91";

        const phoneNumber =
          sessionStorage.getItem("phoneNumber") ||
          sessionStorage.getItem("visitorPhoneNumber");

        console.log("Fetching bookings for:", phoneCountryCode, phoneNumber);

        // ✅ Only fetch bookings
        const bookings = await guestService.getAllBookings(
          phoneCountryCode,
          phoneNumber,
        );

        if (!bookings || bookings.length === 0) {
          setHistory([]);
          return;
        }

        // Step 1: Get unique tenant IDs
        const uniqueTenantIds = [...new Set(bookings.map((b) => b.tenantId))];

        console.log("Unique Tenant IDs:", uniqueTenantIds);

        // Step 2: Fetch each tenant only once
        const tenantMap = {};

        await Promise.all(
          uniqueTenantIds.map(async (tenantId) => {
            try {
              console.log("Calling tenant API with ID:", tenantId);

              const tenantResponse =
                await tenantService.getTenantById(tenantId);

              tenantMap[tenantId] = tenantResponse;
            } catch (error) {
              console.error(`Error fetching tenant ${tenantId}`, error);
              tenantMap[tenantId] = null;
            }
          }),
        );

        // Step 3: Attach tenant data to bookings
        const enrichedBookings = bookings.map((booking) => ({
          ...booking,
          tenantData: tenantMap[booking.tenantId] || null,
        }));

        console.log(enrichedBookings);

        setHistory(enrichedBookings);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="w-full h-dvh bg-white px-4 py-5 flex flex-col overflow-y-auto">
      <MobileHeader
        showBack={false}
        rightComponent={
          <div
            onClick={() => navigate("/profile")}
            className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 active:scale-95 transition-all"
          >
            <User size={20} className="text-gray-600" />
          </div>
        }
      />

      {/* Title */}
      <h1 className="text-2xl text-brand mb-2">{HISTORY_UI.TITLE}</h1>

      {/* Description */}
      <p className="text-sm text-gray-500 mb-6 leading-[20px]">
        {HISTORY_UI.DESCRIPTION}
      </p>

      {/* History List */}
      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <div className="space-y-4">
          {history.map((item) => {
            const logoSrc = item.tenantData?.logo
              ? `data:${item.tenantData.logoContentType};base64,${item.tenantData.logo}`
              : null;

            const datePart = item.bookingId?.split("-##-")[1];

            const formatDate = (dateStr) => {
              if (!dateStr) return "N/A";

              const [day, month, year, hour, min] = dateStr.split(":");

              const months = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ];

              const monthName = months[parseInt(month, 10) - 1];
              const shortYear = year.slice(-2);

              let h = parseInt(hour, 10);
              const ampm = h >= 12 ? "PM" : "AM";

              h = h % 12;
              h = h === 0 ? 12 : h;

              const formattedHour = h.toString().padStart(2, "0");

              return `${day} ${monthName} ${shortYear}, ${formattedHour}:${min} ${ampm}`;
            };

            return (
              <div
                key={item.bookingId}
                className="flex items-center justify-between border-b border-gray-100 pb-4"
              >
                <div className="flex items-center gap-3">
                  {/* ✅ Default icon only */}
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                    {logoSrc ? (
                      <img
                        src={logoSrc}
                        alt="tenant logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 size={18} className="text-brand" />
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold">
                      {item.propertyName || "Unknown Location"}
                    </h4>

                    <p className="text-xs text-gray-500">
                      {item.ota || "Visit"} • {formatDate(datePart)}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-green-100 text-green-600">
                  COMPLETED
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex-1" />
    </div>
  );
};

export default CheckinHistory;
