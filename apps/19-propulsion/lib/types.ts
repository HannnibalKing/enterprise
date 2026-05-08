export interface SpaceUser {
  id: string; name: string; role: string; passwordHash: string;
}
export interface Engine {
  id: string; designation: string; type: string; propellant: string;
  thrustKN: number; ispSL: number; ispVac: number; chamberPressureBar: number;
  throttleRange: string; status: 'operational'|'testing'|'decommissioned';
}
export interface TestRun {
  id: string; engineId: string; date: string; duration: number;
  type: 'hot-fire'|'cold-flow'|'ignition-test'; thrustAchievedKN: number;
  result: 'pass'|'partial'|'fail'; engineer: string; notes: string;
}
export interface Component {
  id: string; engineId: string; name: string; partNumber: string;
  material: string; quantity: number; status: string; supplier: string;
}
export interface Store {
  users: SpaceUser[];
  engines: Engine[];
  testRuns: TestRun[];
  components: Component[];
}
