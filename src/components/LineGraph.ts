import * as d3 from 'd3';
import { PointGroup } from '../types';

export default class LineGraph {
  private pointGroups: PointGroup[] = [];

  // These are the editable points
  private points: [number, number][] = [];
  private svg:
    | d3.Selection<SVGSVGElement, unknown, null, undefined>
    | undefined;
  private line: d3.Line<[number, number]>;
  private xScale: d3.ScaleLinear<number, number>;
  private yScale: d3.ScaleLinear<number, number>;
  private xOff: number = 40;
  private yOff: number = 20;

  constructor() {
    this.line = d3.line();
    // Setup scales
    this.xScale = d3.scaleLinear().domain([2024, 2074]).range([0, 800]);
    this.yScale = d3.scaleLinear().domain([0, 100]).range([600, 0]);
  }

  initialize(
    svgElement: SVGSVGElement,
    isReadOnly: boolean = true,
    pointGroups: PointGroup[] = [],
    points: [number, number][] = []
  ) {
    this.pointGroups = pointGroups;
    this.points = points;
    this.svg = d3
      .select(svgElement)
      .attr('width', 840) // Increase width to accommodate the margin
      .attr('height', 640) // Increase height to accommodate the margin
      .style('border', '1px solid black');

    this.svg
      .append('g') // Append a group element for the plot area
      // Apply a translation to create the margin
      .attr(
        'transform',
        `translate(${this.xOff}, ${this.yScale(0) + this.yOff})`
      )
      .call(d3.axisBottom(this.xScale).tickFormat(d3.format('d')));

    this.svg
      .append('g') // Append a group element for the plot area
      .attr('transform', `translate(${this.xOff}, ${this.yOff})`) // Apply a translation to create the margin
      .call(d3.axisLeft(this.yScale));

    if (!isReadOnly) {
      this.svg.on('click', (event: MouseEvent) => {
        // Use event passed from the listener
        if (!this.svg) {
          return; // Guard clause if svg is null
        }
        const [x, y] = d3.pointer(event, this.svg.node());
        const year = Math.round(this.xScale.invert(x - this.xOff));
        const value = this.yScale.invert(y - this.yOff);
        this.addPoint([year, value]);
        this.updateGraph();
        this.updatePoints();
      });
    }
  }

  updatePointGroups(pointGroups: PointGroup[]) {
    this.pointGroups = pointGroups;
    this.updateGraph();
  }

  updatePoints() {
    // This should be overridden by the React component
  }

  getPoints(): [number, number][] {
    return this.points;
  }

  addPoint(point: [number, number]): void {
    const pointX = Math.max(point[0], 2024);
    const pointY = Math.max(point[1], 0);
    const existingPointIndex = this.points.findIndex((p) => p[0] === pointX);
    if (existingPointIndex !== -1) {
      this.points[existingPointIndex] = [pointX, pointY];
    } else {
      this.points.push([pointX, pointY]);
    }
    this.points.sort((a, b) => a[0] - b[0]);
  }

  updateGraph() {
    if (!this.svg) {
      return; // Guard clause if svg is null
    }

    this.svg
      .selectAll('path.apath') // Select all path elements with class "apath"
      .remove(); // Remove all selected elements

    this.svg
      .selectAll('path.apath')
      .data([this.points])
      .join('path')
      .attr(
        'd',
        this.line
          .x((d) => this.xScale(d[0]) + this.xOff)
          .y((d) => this.yScale(d[1]) + this.yOff)
      )
      .attr('class', 'apath')
      .style('fill', 'none')
      .style('stroke', 'black')
      .style('stroke-width', 2);

    this.svg
      .selectAll('circle')
      .data(this.points)
      .join('circle')
      .attr('cx', (d) => this.xScale(d[0]) + this.xOff)
      .attr('cy', (d) => this.yScale(d[1]) + this.yOff)
      .attr('r', 5)
      .style('fill', 'cyan')
      .style('stroke', 'black')
      .style('stroke-width', 1)
      .raise(); // Move the circles to the top of the SVG element

    this.pointGroups.forEach((pointGroup, idx) => {
      if (!this.svg) {
        return; // Guard clause if svg is null
      }

      this.svg
        .selectAll(`path${idx}`) // Use unique class for each path
        .data([pointGroup.points])
        .join('path')
        .attr(
          'd',
          this.line
            .x((d) => this.xScale(d[0]) + this.xOff)
            .y((d) => this.yScale(d[1]) + this.yOff)
        )
        .style('fill', 'none')
        .style('stroke', pointGroup.color)
        .style('stroke-width', 2);
      // .attr('class', idx); // Assign unique class to the path
    });
  }
}
