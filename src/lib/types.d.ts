export interface Simulation {
  throws: number;
  runs: {
    snakeEye: number;
    lowPoint: number;
  };
  snakeEyeFails: number;
  lowPointFails: number;
}
