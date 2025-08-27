import React, { createContext, useState, useContext } from "react";

const CaretakerDashboardContext = createContext();

export function CaretakerDashboardProvider({ children }) {
  const [recentRelocations, setRecentRelocations] = useState([]);

  return (
    <CaretakerDashboardContext.Provider value={{ recentRelocations, setRecentRelocations }}>
      {children}
    </CaretakerDashboardContext.Provider>
  );
}

export const useCaretakerDashboard = () => useContext(CaretakerDashboardContext);
