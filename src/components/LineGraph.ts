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
  private xOff: number = 80;
  private yOff: number = 20;
  private currentYear: number = 0;
  // private minYear: number = 0;
  private maxYear: number = 0;
  private yearsToForecast: number = 50;
  private minVal: number = 0;
  private maxVal: number = 100;
  private width: number = 800;
  private height: number = 600;
  private hoverIndex: number = -1;
  private selectedCircle: any = null;
  private dragged: boolean = false;
  private editable: boolean = false;

  constructor(editable: boolean, width: number, height: number) {
    this.editable = editable;
    this.width = width;
    this.height = height;
    this.line = d3.line();
    this.currentYear = new Date().getFullYear();
    // TODO: Make this earlier if there is a dataset
    // this.minYear = this.currentYear;
    this.maxYear = this.currentYear + this.yearsToForecast;
    this.xScale = d3
      .scaleLinear()
      .domain([this.currentYear, this.maxYear])
      .range([0, this.width]);
    this.yScale = d3.scaleLinear().domain([0, 1]).range([this.height, 0]);
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
      .attr('width', this.width + this.xOff * 2) // Increase width to accommodate the margin
      .attr('height', this.height + this.yOff * 2) // Increase height to accommodate the margin
      .style('border', '1px solid black');

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
    this.updateGraph();
  }

  updateMinMax(minVal: number, maxVal: number) {
    this.minVal = minVal;
    this.maxVal = maxVal;
    this.xScale = d3
      .scaleLinear()
      .domain([this.currentYear, this.maxYear])
      .range([0, this.width]);
    this.yScale = d3
      .scaleLinear()
      .domain([this.minVal, this.maxVal])
      .range([this.height, 0]);

    if (this.svg) {
      this.svg
        .selectAll('.xaxis') // Select all path elements with class "apath"
        .remove(); // Remove all selected elements

      this.svg
        .append('g') // Append a group element for the plot area
        .attr('class', 'xaxis')
        .attr(
          'transform',
          `translate(${this.xOff}, ${this.yScale(0) + this.yOff})`
        )
        .call(d3.axisBottom(this.xScale).tickFormat(d3.format('d')));

      this.svg
        .selectAll('.yaxis') // Select all path elements with class "apath"
        .remove(); // Remove all selected elements

      this.svg
        .append('g') // Append a group element for the plot area
        .attr('transform', `translate(${this.xOff}, ${this.yOff})`) // Apply a translation to create the margin
        .attr('class', 'yaxis')
        .call(d3.axisLeft(this.yScale));
    }
  }

  updatePointGroups(pointGroups: PointGroup[]) {
    // TODO: Adjust the scales based on min/max from data
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
    const pointX = Math.max(Math.min(point[0], this.maxYear), this.currentYear);
    const pointY = Math.max(Math.min(point[1], this.maxVal), this.minVal);
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
          .curve(d3.curveCatmullRom.alpha(1))
      )
      .attr('class', 'apath')
      .style('fill', 'none')
      .style('stroke', 'black')
      .style('stroke-width', 2);

    const drag = d3
      .drag()
      .on('start', (event, d) => {
        this.dragged = false;
        const target = event.sourceEvent.target;
        const targetData = target.__data__;

        d3.select(target).raise();
        // Using a css class didn't seem to work
        // .classed('activeCircle', true)

        this.hoverIndex = this.points.findIndex(
          (point) => point[0] === targetData[0] && point[1] === targetData[1]
        );

        this.selectedCircle = target;
      })
      .on('drag', (event, d) => {
        this.dragged = true;
        if (!this.svg) {
          return; // Guard clause if svg is null
        }
        const [x, y] = d3.pointer(event, this.svg.node());
        const year = Math.round(this.xScale.invert(x - this.xOff));
        const value = this.yScale.invert(y - this.yOff);
        const pt_x = Math.max(Math.min(year, this.maxYear), this.currentYear);
        const pt_y = Math.max(Math.min(value, this.maxVal), this.minVal);
        d3.select(this.selectedCircle)
          .attr('cx', this.xScale(pt_x) + this.xOff)
          .attr('cy', this.yScale(pt_y) + this.yOff);

        if (this.hoverIndex !== -1) {
          this.points[this.hoverIndex] = [pt_x, pt_y];
        }
        this.updateGraph();
      })
      .on('end', (event, d) => {
        // d3.select(event.sourceEvent.target).classed('activeCircle', false);

        if (!this.dragged) {
          if (this.hoverIndex !== -1) {
            this.points.splice(this.hoverIndex, 1);
          }
        }
        // Ensure that after dragging there is not any
        // issue with the order of the points
        this.points.sort((a, b) => a[0] - b[0]);

        // Ensure that after dragging we cannot have two points
        // with the same x value
        const uniquePoints = Array.from(
          new Set(this.points.map((point) => point[0]))
        );
        const duplicatePoints = uniquePoints.filter(
          (point) => this.points.filter((p) => p[0] === point).length > 1
        );
        duplicatePoints.forEach((point) => {
          const duplicateIndex = this.points.findIndex(
            (p) => p[0] === point && this.points.indexOf(p) !== this.hoverIndex
          );
          if (duplicateIndex !== -1) {
            this.points.splice(duplicateIndex, 1);
          }
        });
        this.dragged = false;
        this.hoverIndex = -1;
        this.updateGraph();
      });

    if (this.editable) {
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
        // @ts-ignore
        .call(drag)
        .raise();
    } else {
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
        .raise();
    }

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
