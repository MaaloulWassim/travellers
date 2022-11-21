import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import TourList from "../components/TourList";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import { useHttpClient } from "../../shared/hooks/http-hook";

const UserTours = () => {
  const [loadedTours, setloadedTours] = useState();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const userId = useParams().userId;
  useEffect(() => {
    const fetchTours = async () => {
      try {
        const responseData = await sendRequest(
          `http://localhost:5000/api/tours/user/${userId}`
        );
        setloadedTours(responseData.tours);
      } catch (err) {}
    };
    fetchTours();
  }, [sendRequest, userId]);

  const tourDeletedHandler = (deletedTourId) => {
    setloadedTours((prevTours) =>
      prevTours.filter((tour) => tour.id !== deletedTourId)
    );
  };
  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && loadedTours && (
        <TourList items={loadedTours} onDeleteTour={tourDeletedHandler} />
      )}
    </React.Fragment>
  );
};

export default UserTours;
