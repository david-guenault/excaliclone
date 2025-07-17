// ABOUTME: Spatial indexing system with quad-tree for performance optimization
// ABOUTME: Enables efficient element lookup and hit testing for large drawings

import type { Element, Point } from '../types';

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpatialNode {
  bounds: Rectangle;
  elements: Element[];
  children: SpatialNode[] | null;
  maxElements: number;
  maxDepth: number;
  depth: number;
}

/**
 * Quad-tree implementation for spatial indexing of elements
 */
export class SpatialIndex {
  private root: SpatialNode;
  private readonly maxElements: number;
  private readonly maxDepth: number;

  constructor(
    bounds: Rectangle,
    maxElements: number = 10,
    maxDepth: number = 8
  ) {
    this.maxElements = maxElements;
    this.maxDepth = maxDepth;
    this.root = {
      bounds,
      elements: [],
      children: null,
      maxElements,
      maxDepth,
      depth: 0
    };
  }

  /**
   * Insert an element into the spatial index
   */
  public insert(element: Element): void {
    this.insertIntoNode(this.root, element);
  }

  /**
   * Remove an element from the spatial index
   */
  public remove(element: Element): boolean {
    return this.removeFromNode(this.root, element);
  }

  /**
   * Update an element's position in the spatial index
   */
  public update(element: Element): void {
    this.remove(element);
    this.insert(element);
  }

  /**
   * Query elements within a rectangular region
   */
  public query(region: Rectangle): Element[] {
    const result: Element[] = [];
    this.queryNode(this.root, region, result);
    return result;
  }

  /**
   * Find elements at a specific point
   */
  public queryPoint(point: Point): Element[] {
    return this.query({
      x: point.x,
      y: point.y,
      width: 0,
      height: 0
    });
  }

  /**
   * Find elements within a circular region
   */
  public queryCircle(center: Point, radius: number): Element[] {
    // First get candidates from rectangular region
    const candidates = this.query({
      x: center.x - radius,
      y: center.y - radius,
      width: radius * 2,
      height: radius * 2
    });

    // Filter by actual circular distance
    return candidates.filter(element => {
      const elementCenter = {
        x: element.x + element.width / 2,
        y: element.y + element.height / 2
      };
      const distance = Math.sqrt(
        Math.pow(center.x - elementCenter.x, 2) + 
        Math.pow(center.y - elementCenter.y, 2)
      );
      return distance <= radius;
    });
  }

  /**
   * Clear all elements from the index
   */
  public clear(): void {
    this.root.elements = [];
    this.root.children = null;
  }

  /**
   * Rebuild the entire index with new elements
   */
  public rebuild(elements: Element[]): void {
    this.clear();
    elements.forEach(element => this.insert(element));
  }

  /**
   * Get statistics about the spatial index
   */
  public getStats(): {
    totalNodes: number;
    totalElements: number;
    maxDepthReached: number;
    avgElementsPerLeaf: number;
  } {
    const stats = {
      totalNodes: 0,
      totalElements: 0,
      maxDepthReached: 0,
      leafNodes: 0,
      totalLeafElements: 0
    };

    this.collectStats(this.root, stats);

    return {
      totalNodes: stats.totalNodes,
      totalElements: stats.totalElements,
      maxDepthReached: stats.maxDepthReached,
      avgElementsPerLeaf: stats.leafNodes > 0 ? stats.totalLeafElements / stats.leafNodes : 0
    };
  }

  private insertIntoNode(node: SpatialNode, element: Element): void {
    // If element doesn't fit in this node, don't insert
    if (!this.elementIntersectsRect(element, node.bounds)) {
      return;
    }

    // If node has children, try to insert into children
    if (node.children) {
      for (const child of node.children) {
        this.insertIntoNode(child, element);
      }
      return;
    }

    // Add element to this node
    node.elements.push(element);

    // If node exceeds capacity and can be subdivided, subdivide
    if (node.elements.length > node.maxElements && node.depth < node.maxDepth) {
      this.subdivideNode(node);
    }
  }

  private subdivideNode(node: SpatialNode): void {
    const halfWidth = node.bounds.width / 2;
    const halfHeight = node.bounds.height / 2;
    const x = node.bounds.x;
    const y = node.bounds.y;

    node.children = [
      // Top-left
      {
        bounds: { x, y, width: halfWidth, height: halfHeight },
        elements: [],
        children: null,
        maxElements: node.maxElements,
        maxDepth: node.maxDepth,
        depth: node.depth + 1
      },
      // Top-right
      {
        bounds: { x: x + halfWidth, y, width: halfWidth, height: halfHeight },
        elements: [],
        children: null,
        maxElements: node.maxElements,
        maxDepth: node.maxDepth,
        depth: node.depth + 1
      },
      // Bottom-left
      {
        bounds: { x, y: y + halfHeight, width: halfWidth, height: halfHeight },
        elements: [],
        children: null,
        maxElements: node.maxElements,
        maxDepth: node.maxDepth,
        depth: node.depth + 1
      },
      // Bottom-right
      {
        bounds: { x: x + halfWidth, y: y + halfHeight, width: halfWidth, height: halfHeight },
        elements: [],
        children: null,
        maxElements: node.maxElements,
        maxDepth: node.maxDepth,
        depth: node.depth + 1
      }
    ];

    // Redistribute elements to children
    const elementsToRedistribute = [...node.elements];
    node.elements = [];

    for (const element of elementsToRedistribute) {
      for (const child of node.children) {
        this.insertIntoNode(child, element);
      }
    }
  }

  private removeFromNode(node: SpatialNode, element: Element): boolean {
    // Try to remove from current node
    const index = node.elements.findIndex(el => el.id === element.id);
    if (index !== -1) {
      node.elements.splice(index, 1);
      return true;
    }

    // Try to remove from children
    if (node.children) {
      for (const child of node.children) {
        if (this.removeFromNode(child, element)) {
          return true;
        }
      }
    }

    return false;
  }

  private queryNode(node: SpatialNode, region: Rectangle, result: Element[]): void {
    // If region doesn't intersect with node bounds, skip
    if (!this.rectanglesIntersect(region, node.bounds)) {
      return;
    }

    // Add elements from this node that intersect with region
    for (const element of node.elements) {
      if (this.elementIntersectsRect(element, region)) {
        result.push(element);
      }
    }

    // Query children
    if (node.children) {
      for (const child of node.children) {
        this.queryNode(child, region, result);
      }
    }
  }

  private collectStats(node: SpatialNode, stats: any): void {
    stats.totalNodes++;
    stats.maxDepthReached = Math.max(stats.maxDepthReached, node.depth);

    if (node.children) {
      for (const child of node.children) {
        this.collectStats(child, stats);
      }
    } else {
      // Leaf node
      stats.leafNodes++;
      stats.totalLeafElements += node.elements.length;
      stats.totalElements += node.elements.length;
    }
  }

  private elementIntersectsRect(element: Element, rect: Rectangle): boolean {
    return !(
      element.x + element.width < rect.x ||
      element.x > rect.x + rect.width ||
      element.y + element.height < rect.y ||
      element.y > rect.y + rect.height
    );
  }

  private rectanglesIntersect(rect1: Rectangle, rect2: Rectangle): boolean {
    return !(
      rect1.x + rect1.width < rect2.x ||
      rect1.x > rect2.x + rect2.width ||
      rect1.y + rect1.height < rect2.y ||
      rect1.y > rect2.y + rect2.height
    );
  }
}

/**
 * Optimized hit testing using spatial index
 */
export function spatialHitTest(
  spatialIndex: SpatialIndex,
  point: Point,
  elements: Element[]
): Element | null {
  // Get candidates from spatial index
  const candidates = spatialIndex.queryPoint(point);
  
  if (candidates.length === 0) {
    return null;
  }

  // Sort candidates by z-index (reverse order for front-to-back)
  const sortedCandidates = candidates
    .slice()
    .reverse()
    .filter(element => !element.locked);

  // Perform detailed hit testing on candidates
  for (const element of sortedCandidates) {
    if (isPointInElement(point, element)) {
      return element;
    }
  }

  return null;
}

/**
 * Detailed point-in-element testing
 */
function isPointInElement(point: Point, element: Element): boolean {
  // Basic bounding box test
  if (
    point.x < element.x ||
    point.x > element.x + element.width ||
    point.y < element.y ||
    point.y > element.y + element.height
  ) {
    return false;
  }

  // Detailed shape testing
  switch (element.type) {
    case 'circle':
      return isPointInCircle(point, element);
    case 'pen':
      return isPointInPenStroke(point, element);
    default:
      return true; // Rectangle, text, image, line, arrow
  }
}

function isPointInCircle(point: Point, element: Element): boolean {
  const centerX = element.x + element.width / 2;
  const centerY = element.y + element.height / 2;
  const radiusX = element.width / 2;
  const radiusY = element.height / 2;

  const normalizedX = (point.x - centerX) / radiusX;
  const normalizedY = (point.y - centerY) / radiusY;

  return normalizedX * normalizedX + normalizedY * normalizedY <= 1;
}

function isPointInPenStroke(point: Point, element: Element): boolean {
  if (!element.points || element.points.length < 2) {
    return false;
  }

  const tolerance = Math.max(element.strokeWidth * 2, 8);

  for (let i = 0; i < element.points.length - 1; i++) {
    const p1 = element.points[i];
    const p2 = element.points[i + 1];

    if (distancePointToLineSegment(point, p1, p2) <= tolerance) {
      return true;
    }
  }

  return false;
}

function distancePointToLineSegment(point: Point, p1: Point, p2: Point): number {
  const A = point.x - p1.x;
  const B = point.y - p1.y;
  const C = p2.x - p1.x;
  const D = p2.y - p1.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  
  if (lenSq === 0) {
    // p1 and p2 are the same point
    return Math.sqrt(A * A + B * B);
  }

  let param = dot / lenSq;

  let xx: number, yy: number;

  if (param < 0) {
    xx = p1.x;
    yy = p1.y;
  } else if (param > 1) {
    xx = p2.x;
    yy = p2.y;
  } else {
    xx = p1.x + param * C;
    yy = p1.y + param * D;
  }

  const dx = point.x - xx;
  const dy = point.y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

