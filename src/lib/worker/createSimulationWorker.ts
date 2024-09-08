import workerURL from "./simulationWorker.ts?url";

export default () => new Worker(workerURL);
