export default function worker(e) {
  console.log("KRASHTEST WORKER:", e);
  switch (e.data.name) {
    case "notification":
      console.log("Notification:");
      new Notification("H-land - Games", { body: "H-land - worker" });
      break;
    default:
      console.error("Unknown message:", e.data.name);
  }
}