import React from "react";
import WarehouseView from "./WarehouseView";
import { QC_STAGES } from "../constants";

const QCCheckpointView = (props) => {
  return (
    <WarehouseView
      {...props}
      title="QC Checkpoint"
      stageOptions={QC_STAGES}
      showWarehouseFilter={false}
    />
  );
};

export default QCCheckpointView;
