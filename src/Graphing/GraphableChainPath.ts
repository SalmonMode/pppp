import type { ChainPath, TaskUnit } from "../Relations";

export default class GraphableChainPath {
  public units: TaskUnit[];
  public tracks: TaskUnit[][];
  constructor(public path: ChainPath) {
    this.units = this.path.chains.reduce(
      (acc: TaskUnit[], chain) => [...acc, ...chain.units],
      []
    );
    this.tracks = this._buildTracks();
  }
  private _buildTracks(): TaskUnit[][] {
    const tracks: TaskUnit[][] = [[]];
    // Units should already be sorted from latest to earliest
    const tasks = [...this.units];
    // Sort them according to anticipated start date so they go from latest to earliest just to be safe. This is to help
    // layer the tracks in a way that shows them branching away from the center (as needed) as time goes on, rather than
    // starting out in open space and moving towards the center.
    tasks.sort(
      (a, b) =>
        b.anticipatedStartDate.getTime() - a.anticipatedStartDate.getTime()
    );
    let nextTask = tasks.pop();
    while (nextTask) {
      // nextTask is used for loop logic, so track the current task for easier type safety
      const currentTask: TaskUnit = nextTask;
      for (let track of tracks) {
        // check if this can squeeze in after the last task on this track
        const lastItemInTrack = track[track.length - 1];
        if (!lastItemInTrack) {
          // No item in this track, which means this must be the first track and our first run through both loops.
          track.push(currentTask);
          nextTask = tasks.pop();
          break;
        } else if (
          lastItemInTrack.endDate <= currentTask.anticipatedStartDate
        ) {
          // It can fit in this track, so add it here and move on to the next track.
          track.push(currentTask);
          nextTask = tasks.pop();
          break;
        }
        // Can't fit in this track, so move on to the next track (if there is one).
      }
      if (nextTask === currentTask) {
        // Didn't find a place to put it. It must not fit in any of the tracks, so add a new one with the current task.
        tracks.push([currentTask]);
        nextTask = tasks.pop();
      }
    }
    return tracks;
  }
}
