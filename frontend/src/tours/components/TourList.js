import React from "react";

import Card from "../../shared/components/UIElements/Card";
import TourItem from "./TourItem";
import Button from "../../shared/components/FormElements/Button";
import "./TourItem";

const TourList = (props) => {
  if (props.items.length === 0) {
    return (
      <div className="place-list center">
        <Card>
          <h2>No Tour found. Maybe create one?</h2>
          <Button to="/Tours/new">Share Tour</Button>
        </Card>
      </div>
    );
  }
  return (
    <ul className="place-list">
      {props.items.map((tour) => (
        <TourItem
          key={tour.id}
          id={tour.id}
          image={tour.image}
          title={tour.title}
          description={tour.description}
          duration={tour.duration}
          address={tour.address}
          price={tour.price}
          creatorId={tour.creator}
          onDelete={props.onDeleteTour}
        />
      ))}
    </ul>
  );
};
export default TourList;
