import { ReactNode, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, Marker, Path, Rect } from 'react-native-svg';

export type TreeNode = {
  id: string;
  width: number;
  height: number;
  render: () => ReactNode;
  inArea?: boolean;        // true(default) → 메인 영역 박스 내부
  subAreaId?: string;       // 보조 sub-area 그룹 키 (예: 'key')
  // 'area_top' → areaBox 위 가장자리 가운데로 위치 강제 (label 화살표 끝점용).
  pinTo?: 'area_top' | 'sub_top';
};

export type TreeEdge = {
  from: string;
  to: string;
  // layout 계산용으로만 사용. render는 skip.
  invisible?: boolean;
};

export type AreaBox = {
  color: string;
  pad?: number;
  label?: string;
  labelBg?: string;
  labelTextColor?: string;
  dashed?: boolean;
  dashColor?: string;
};

type Props = {
  nodes: TreeNode[];
  edges: TreeEdge[];
  maxWidth: number;
  hSep?: number;
  vSep?: number;
  marginX?: number;
  marginY?: number;
  areaBox?: AreaBox;
  subAreas?: Array<AreaBox & { id: string }>;
};

const EDGE_COLOR = '#4b5563';
const CORNER_RADIUS = 16;

type Pos = { x: number; y: number };

function pointsToRoundedPath(points: Pos[], radius = CORNER_RADIUS): string {
  if (points.length < 2) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    const inDx = curr.x - prev.x;
    const inDy = curr.y - prev.y;
    const inLen = Math.hypot(inDx, inDy);
    const outDx = next.x - curr.x;
    const outDy = next.y - curr.y;
    const outLen = Math.hypot(outDx, outDy);
    const r = Math.min(radius, inLen / 2, outLen / 2);
    if (r < 0.5) {
      d += ` L ${curr.x} ${curr.y}`;
      continue;
    }
    const beforeX = curr.x - (inDx / inLen) * r;
    const beforeY = curr.y - (inDy / inLen) * r;
    const afterX = curr.x + (outDx / outLen) * r;
    const afterY = curr.y + (outDy / outLen) * r;
    d += ` L ${beforeX} ${beforeY} Q ${curr.x} ${curr.y} ${afterX} ${afterY}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}

export function TreeCanvas({
  nodes,
  edges,
  maxWidth,
  hSep = 12,
  vSep = 60,
  marginX = 0,
  marginY = 14,
  areaBox,
  subAreas,
}: Props) {
  const layout = useMemo(() => {
    if (nodes.length === 0) {
      return {
        width: 0,
        height: 0,
        positions: new Map<string, Pos>(),
        edgePaths: [] as { from: string; to: string; points: Pos[] }[],
        areaBounds: null as null | { x: number; y: number; width: number; height: number },
        subAreaBounds: [] as Array<{ id: string; x: number; y: number; width: number; height: number }>,
      };
    }

    const nodeById = new Map(nodes.map((n) => [n.id, n]));
    const ids = new Set(nodes.map((n) => n.id));

    const parents = new Map<string, string[]>();
    edges.forEach((e) => {
      if (!ids.has(e.from) || !ids.has(e.to)) return;
      if (!parents.has(e.to)) parents.set(e.to, []);
      parents.get(e.to)!.push(e.from);
    });

    // natural rank
    const rankOf = new Map<string, number>();
    const visiting = new Set<string>();
    const hasOuter = nodes.some((n) => n.inArea === false);
    const computeRank = (id: string): number => {
      if (rankOf.has(id)) return rankOf.get(id)!;
      if (visiting.has(id)) return 0;
      visiting.add(id);
      const ps = parents.get(id) ?? [];
      let r = 0;
      if (ps.length > 0) r = Math.max(...ps.map(computeRank)) + 1;
      visiting.delete(id);
      rankOf.set(id, r);
      return r;
    };
    nodes.forEach((n) => computeRank(n.id));

    // 모든 inner 노드는 최대 outer rank + 1 보다 아래 (큰 rank) 에 둠 — outer/inner row 가 섞이지 않도록.
    if (hasOuter) {
      const outerNodeList = nodes.filter((n) => n.inArea === false);
      const innerNodeList = nodes.filter((n) => n.inArea !== false && !n.subAreaId);
      if (outerNodeList.length > 0 && innerNodeList.length > 0) {
        const maxOuterRank = Math.max(
          0,
          ...outerNodeList.map((n) => rankOf.get(n.id) ?? 0),
        );
        const minInnerRank = Math.min(
          ...innerNodeList.map((n) => rankOf.get(n.id) ?? 0),
        );
        const shift = maxOuterRank + 1 - minInnerRank;
        if (shift > 0) {
          innerNodeList.forEach((n) => {
            rankOf.set(n.id, (rankOf.get(n.id) ?? 0) + shift);
          });
        }
      }
    }

    // inner subgraph에서 isolated (inner 부모/자식 둘 다 없음) 인 inner 노드는 max inner rank + 1로 강제
    // SRS Figure 5의 CS.311처럼 outer-only prereq를 가진 inner 노드를 아래쪽 row로 배치
    const isolatedInnerSet = new Set<string>();
    {
      const innerNodeList = nodes.filter((n) => n.inArea !== false);
      const innerIdSet = new Set(innerNodeList.map((n) => n.id));
      const innerOut = new Map<string, number>();
      const innerIn = new Map<string, number>();
      edges.forEach((e) => {
        if (innerIdSet.has(e.from) && innerIdSet.has(e.to)) {
          innerOut.set(e.from, (innerOut.get(e.from) ?? 0) + 1);
          innerIn.set(e.to, (innerIn.get(e.to) ?? 0) + 1);
        }
      });
      const isolated = innerNodeList.filter(
        (n) =>
          !n.subAreaId &&
          (innerOut.get(n.id) ?? 0) === 0 &&
          (innerIn.get(n.id) ?? 0) === 0,
      );
      const othersConnected = innerNodeList.filter(
        (n) => !isolated.includes(n) && !n.subAreaId,
      );
      if (isolated.length > 0 && othersConnected.length > 0) {
        const baseMax = Math.max(
          ...othersConnected.map((n) => rankOf.get(n.id)!),
        );
        isolated.forEach((n) => {
          rankOf.set(n.id, baseMax + 1);
          isolatedInnerSet.add(n.id);
        });
      }
    }

    // subArea 노드 마지막 rank로 강제
    const subAreaNodeIds = nodes.filter((n) => n.subAreaId).map((n) => n.id);
    if (subAreaNodeIds.length > 0) {
      const others = [...rankOf.entries()].filter(
        ([id]) => !nodeById.get(id)?.subAreaId,
      );
      const baseMax = others.length > 0 ? Math.max(...others.map(([, r]) => r)) : 0;
      subAreaNodeIds.forEach((id) => rankOf.set(id, baseMax + 1));
    }

    // rank별 그룹화 + 정렬 (subAreaId 묶기 + 코드 번호 순)
    const ranksMap = new Map<number, string[]>();
    nodes.forEach((n) => {
      const r = rankOf.get(n.id)!;
      if (!ranksMap.has(r)) ranksMap.set(r, []);
      ranksMap.get(r)!.push(n.id);
    });
    const sortedRanks = [...ranksMap.keys()].sort((a, b) => a - b);
    sortedRanks.forEach((r) => {
      ranksMap.get(r)!.sort((a, b) => {
        const sa = nodeById.get(a)?.subAreaId ?? '';
        const sb = nodeById.get(b)?.subAreaId ?? '';
        if (sa !== sb) return sa.localeCompare(sb);
        return a.localeCompare(b, undefined, { numeric: true });
      });
    });

    // wrap: row 안 노드 width 합 기반 (가변 width 지원)
    const innerW = maxWidth - 2 * marginX;

    type Row = { ids: string[]; y: number; rank: number; height: number };
    const rows: Row[] = [];
    let currentY = marginY;
    const GROUP_GAP = 16;
    const rankType = (r: number): 'outer' | 'inner' | 'sub' => {
      const list = ranksMap.get(r)!;
      const subCount = list.filter((id) => nodeById.get(id)?.subAreaId).length;
      const outerCount = list.filter((id) => nodeById.get(id)?.inArea === false).length;
      if (subCount === list.length) return 'sub';
      if (outerCount === list.length) return 'outer';
      return 'inner';
    };
    const flushChunk = (chunk: string[], rank: number) => {
      if (chunk.length === 0) return;
      const rowH = Math.max(...chunk.map((id) => nodeById.get(id)!.height));
      rows.push({ ids: chunk, y: currentY + rowH / 2, rank, height: rowH });
      currentY += rowH + vSep;
    };
    let prevType: 'outer' | 'inner' | 'sub' | null = null;
    sortedRanks.forEach((r) => {
      const type = rankType(r);
      if (prevType && prevType !== type) currentY += GROUP_GAP;
      prevType = type;
      const rankIds = ranksMap.get(r)!;
      let chunk: string[] = [];
      let chunkW = 0;
      for (const id of rankIds) {
        const w = nodeById.get(id)!.width;
        if (chunk.length > 0 && chunkW + hSep + w > innerW) {
          flushChunk(chunk, r);
          chunk = [];
          chunkW = 0;
        }
        if (chunk.length > 0) chunkW += hSep;
        chunkW += w;
        chunk.push(id);
      }
      flushChunk(chunk, r);
    });

    const positions = new Map<string, Pos>();

    // 다른 inner row(2 노드 이상)의 col 0 x 추출 → isolated row 좌측 정렬에 사용
    let innerCol0X: number | null = null;
    rows.forEach((row) => {
      if (innerCol0X !== null) return;
      const isAllInner = row.ids.every(
        (id) =>
          nodeById.get(id)?.inArea !== false && !isolatedInnerSet.has(id),
      );
      if (isAllInner && row.ids.length >= 2) {
        const totalW =
          row.ids.reduce((sum, id) => sum + nodeById.get(id)!.width, 0) +
          (row.ids.length - 1) * hSep;
        const startX = marginX + (innerW - totalW) / 2;
        const firstNode = nodeById.get(row.ids[0])!;
        innerCol0X = startX + firstNode.width / 2;
      }
    });

    rows.forEach((row) => {
      if (
        row.ids.length === 1 &&
        isolatedInnerSet.has(row.ids[0]) &&
        innerCol0X !== null
      ) {
        // isolated inner 단일 노드 row → 좌측 col 0 위치
        positions.set(row.ids[0], { x: innerCol0X, y: row.y });
        return;
      }
      const totalW =
        row.ids.reduce((sum, id) => sum + nodeById.get(id)!.width, 0) +
        (row.ids.length - 1) * hSep;
      let runningX = marginX + (innerW - totalW) / 2;
      row.ids.forEach((id) => {
        const n = nodeById.get(id)!;
        positions.set(id, { x: runningX + n.width / 2, y: row.y });
        runningX += n.width + hSep;
      });
    });

    const rowIdxById = new Map<string, number>();
    rows.forEach((row, idx) => row.ids.forEach((id) => rowIdxById.set(id, idx)));

    // 같은 row pair 가는 edge 그룹화 → lane 부여
    const lanePairs = new Map<string, TreeEdge[]>();
    edges.forEach((e) => {
      if (!ids.has(e.from) || !ids.has(e.to)) return;
      const pr = rowIdxById.get(e.from);
      const cr = rowIdxById.get(e.to);
      if (pr === undefined || cr === undefined) return;
      const key = `${pr}->${cr}`;
      if (!lanePairs.has(key)) lanePairs.set(key, []);
      lanePairs.get(key)!.push(e);
    });
    const laneOf = new Map<TreeEdge, { idx: number; count: number }>();
    lanePairs.forEach((list) => {
      list.forEach((e, idx) => laneOf.set(e, { idx, count: list.length }));
    });

    // outgoing/incoming spread — visible 엣지만 카운트 (invisible은 layout 강제용)
    const outgoing = new Map<string, TreeEdge[]>();
    const incoming = new Map<string, TreeEdge[]>();
    edges.forEach((e) => {
      if (e.invisible) return;
      if (!ids.has(e.from) || !ids.has(e.to)) return;
      if (!outgoing.has(e.from)) outgoing.set(e.from, []);
      outgoing.get(e.from)!.push(e);
      if (!incoming.has(e.to)) incoming.set(e.to, []);
      incoming.get(e.to)!.push(e);
    });

    // 같은 parent의 outgoing edges는 공통 vertical 후 분기 (T-shape branching)
    const parentBranchGroups = new Map<string, TreeEdge[]>();
    edges.forEach((e) => {
      if (e.invisible) return;
      if (!ids.has(e.from) || !ids.has(e.to)) return;
      if (!parentBranchGroups.has(e.from)) parentBranchGroups.set(e.from, []);
      parentBranchGroups.get(e.from)!.push(e);
    });
    const edgeBranchFirst = new Map<TreeEdge, boolean>();
    const edgeIsBranch = new Set<TreeEdge>();
    parentBranchGroups.forEach((groupEdges) => {
      if (groupEdges.length < 2) return;
      groupEdges.forEach((e, idx) => {
        edgeIsBranch.add(e);
        edgeBranchFirst.set(e, idx === 0);
      });
    });

    // 각 row 안 branch parent에 unique joinY offset (다른 parent의 branch와 겹침 방지)
    const parentJoinYOffset = new Map<string, number>();
    rows.forEach((row) => {
      const branchParents = row.ids.filter(
        (id) => (parentBranchGroups.get(id)?.length ?? 0) >= 2,
      );
      branchParents.forEach((id, idx) => {
        parentJoinYOffset.set(id, idx * 8);
      });
    });

    // 각 row에 점유된 node x 범위 list
    const rowOccupied: Array<Array<{ left: number; right: number; cx: number }>> = rows.map(
      (row) =>
        row.ids.map((id) => {
          const pos = positions.get(id)!;
          const n = nodeById.get(id)!;
          return { left: pos.x - n.width / 2, right: pos.x + n.width / 2, cx: pos.x };
        }),
    );

    // multi-row span edge에 좌/우 lane 할당. lane x는 모든 row의 노드 좌/우 경계 너머에 둠.
    const rowLeftEdge = rows.map((row) =>
      row.ids.reduce(
        (min, id) => Math.min(min, positions.get(id)!.x - nodeById.get(id)!.width / 2),
        Infinity,
      ),
    );
    const rowRightEdge = rows.map((row) =>
      row.ids.reduce(
        (max, id) => Math.max(max, positions.get(id)!.x + nodeById.get(id)!.width / 2),
        -Infinity,
      ),
    );
    // lane은 chip/root row(rank 0,1)와 무관하게 outer/inner row 좌우 외곽 기준으로 잡는다.
    const laneRelevantRowIdx = rows
      .map((row, i) => (row.rank >= 2 ? i : -1))
      .filter((i) => i >= 0);
    const globalMinLeft = laneRelevantRowIdx.length > 0
      ? Math.min(...laneRelevantRowIdx.map((i) => rowLeftEdge[i]))
      : rows.length > 0 ? Math.min(...rowLeftEdge) : marginX;
    const globalMaxRight = laneRelevantRowIdx.length > 0
      ? Math.max(...laneRelevantRowIdx.map((i) => rowRightEdge[i]))
      : rows.length > 0 ? Math.max(...rowRightEdge) : maxWidth - marginX;

    const multiRowEdges = edges.filter((e) => {
      if (!ids.has(e.from) || !ids.has(e.to)) return false;
      const pr = rowIdxById.get(e.from);
      const cr = rowIdxById.get(e.to);
      return pr !== undefined && cr !== undefined && cr - pr >= 2;
    });
    const multiRowLaneSide = new Map<TreeEdge, 'left' | 'right'>();
    const multiRowLaneOffset = new Map<TreeEdge, number>();
    let leftCount = 0;
    let rightCount = 0;
    {
      // 같은 parent의 multi-row edges는 1 lane 공유 → 부모 vertical → enter → 공유 lane vertical → 각 자식별 exit 분기.
      // 자식별 exit가 lane에서 분기되므로 branching이 자식 직전까지 미뤄짐.
      const center = maxWidth / 2;
      type Group = { parent: string; edges: TreeEdge[]; parentX: number; avgToX: number };
      const groupMap = new Map<string, Group>();
      multiRowEdges.forEach((e) => {
        const fromPos = positions.get(e.from);
        const toPos = positions.get(e.to);
        if (!fromPos || !toPos) return;
        if (!groupMap.has(e.from)) {
          groupMap.set(e.from, {
            parent: e.from,
            edges: [],
            parentX: fromPos.x,
            avgToX: 0,
          });
        }
        const g = groupMap.get(e.from)!;
        g.edges.push(e);
      });
      groupMap.forEach((g) => {
        g.avgToX =
          g.edges.reduce((s, e) => s + (positions.get(e.to)?.x ?? 0), 0) /
          g.edges.length;
      });
      const groups = [...groupMap.values()];
      const leftGroups = groups.filter((g) => g.parentX <= center);
      const rightGroups = groups.filter((g) => g.parentX > center);
      // left side: avgToX가 클수록 외곽(idx 0), 작을수록 안쪽
      leftGroups.sort((a, b) => b.avgToX - a.avgToX);
      rightGroups.sort((a, b) => a.avgToX - b.avgToX);
      leftGroups.forEach((g, idx) => {
        g.edges.forEach((e) => {
          multiRowLaneSide.set(e, 'left');
          multiRowLaneOffset.set(e, idx);
        });
      });
      rightGroups.forEach((g, idx) => {
        g.edges.forEach((e) => {
          multiRowLaneSide.set(e, 'right');
          multiRowLaneOffset.set(e, idx);
        });
      });
      leftCount = leftGroups.length;
      rightCount = rightGroups.length;
    }
    const laneMinStep = 10;
    // lane은 카드 옆(area 안쪽 padding 영역)에 둠 — area boundary 바깥으로 안 빠지게.
    const areaInnerGap = 8;
    const leftLaneEnd = globalMinLeft - areaInnerGap;
    const rightLaneStart = globalMaxRight + areaInnerGap;
    // marginX 와 별도로 lane은 항상 screen edge 에서 최소 LANE_EDGE_MARGIN 만큼 띄움.
    const LANE_EDGE_MARGIN = 12;
    const leftLaneBound = LANE_EDGE_MARGIN;
    const rightLaneBound = maxWidth - LANE_EDGE_MARGIN;
    let leftLaneStart = leftLaneBound;
    let rightLaneEnd = rightLaneBound;
    if (leftCount > 1) {
      const span = leftLaneEnd - leftLaneStart;
      const required = (leftCount - 1) * laneMinStep;
      // span 부족하면 leftLaneStart 를 LANE_EDGE_MARGIN 까지만 좌측으로 확장 (screen 밖으로 안 나가게)
      if (span < required) leftLaneStart = Math.max(leftLaneBound, leftLaneEnd - required);
    }
    if (rightCount > 1) {
      const span = rightLaneEnd - rightLaneStart;
      const required = (rightCount - 1) * laneMinStep;
      if (span < required) rightLaneEnd = Math.min(rightLaneBound, rightLaneStart + required);
    }
    const leftLaneStep = leftCount > 1 ? (leftLaneEnd - leftLaneStart) / (leftCount - 1) : 0;
    const rightLaneStep = rightCount > 1 ? (rightLaneEnd - rightLaneStart) / (rightCount - 1) : 0;

    // ===== 새로운 동적 vSep 시스템 =====
    // gap[i] = row[i] 와 row[i+1] 사이 공간.
    // 각 edge는 자기 horizontal segment 하나(인접) 또는 두 개(multi-row: enter + exit)를 어떤 gap에 차지함.
    // gap 안에서 horizontal은 10px 간격으로 stacked. gap 높이 = (slotCount + 1) * 10.
    const SLOT_SPACING = 10;
    const MIN_GAP = 16;
    // 마지막 slot 과 다음 row top 사이에 확보할 vertical entry 길이.
    // CORNER_RADIUS(16) 보다 충분히 크게 잡아 진입 직선이 시각적으로 드러나도록.
    const ENTRY_RESERVE = 22;
    const numGaps = Math.max(0, rows.length - 1);

    type Req = {
      edge: TreeEdge;
      gap: number;
      kind: 'enter' | 'exit' | 'adjacent';
      sortKey: number;
    };
    const reqsByGap: Req[][] = Array.from({ length: numGaps }, () => []);
    edges.forEach((e) => {
      if (e.invisible) return;
      if (!ids.has(e.from) || !ids.has(e.to)) return;
      const pr = rowIdxById.get(e.from);
      const cr = rowIdxById.get(e.to);
      if (pr === undefined || cr === undefined || cr <= pr) return;
      const toPos = positions.get(e.to);
      if (cr - pr === 1) {
        reqsByGap[pr].push({
          edge: e,
          gap: pr,
          kind: 'adjacent',
          sortKey: toPos?.x ?? 0,
        });
      } else {
        const laneOff = multiRowLaneOffset.get(e) ?? 0;
        reqsByGap[pr].push({ edge: e, gap: pr, kind: 'enter', sortKey: laneOff });
        reqsByGap[cr - 1].push({ edge: e, gap: cr - 1, kind: 'exit', sortKey: -laneOff });
      }
    });

    // slot 번호 부여:
    //   같은 parent의 enter edges 는 1 slot 공유 (분기점을 한 점으로 모음 — T-shape).
    //   같은 parent의 adjacent edges 도 1 slot 공유.
    //   exit edges 는 per-edge 별로 slot.
    //   정렬: exit(위, 도착 부근) → adjacent(중간) → enter(아래, 늦은 분기).
    const slotOf = new Map<TreeEdge, { gap: number; slot: number; kind: Req['kind'] }[]>();
    const gapSlotCount: number[] = new Array(numGaps).fill(0);
    reqsByGap.forEach((reqs, gap) => {
      // group by (kind, key) where key = parent for enter/adjacent, edge id for exit
      type Group = { kind: Req['kind']; key: string; edges: TreeEdge[]; sortKey: number };
      const groupMap = new Map<string, Group>();
      reqs.forEach((req) => {
        const key =
          req.kind === 'exit'
            ? `exit:${req.edge.from}->${req.edge.to}`
            : `${req.kind}:${req.edge.from}`;
        if (!groupMap.has(key)) {
          groupMap.set(key, { kind: req.kind, key, edges: [], sortKey: req.sortKey });
        }
        const g = groupMap.get(key)!;
        g.edges.push(req.edge);
        if (req.kind === 'exit') g.sortKey = req.sortKey;
        else g.sortKey = Math.min(g.sortKey, req.sortKey);
      });
      const groups = [...groupMap.values()];
      groups.sort((a, b) => {
        // rank: 큰 값일수록 큰 slot idx(= 아래쪽).
        // enter는 가장 아래 (늦은 분기) — 단, adjacent는 도착 직전이므로 가장 아래 양보.
        const rank = (k: Req['kind']) => (k === 'exit' ? 0 : k === 'enter' ? 1 : 2);
        const dr = rank(a.kind) - rank(b.kind);
        if (dr !== 0) return dr;
        return a.sortKey - b.sortKey;
      });
      groups.forEach((g, slot) => {
        g.edges.forEach((e) => {
          const list = slotOf.get(e) ?? [];
          list.push({ gap, slot, kind: g.kind });
          slotOf.set(e, list);
        });
      });
      gapSlotCount[gap] = groups.length;
    });

    // 각 gap height = max(MIN_GAP, count*SLOT_SPACING + ENTRY_RESERVE).
    // slot 0..count-1 은 gapTop + (k+1)*SLOT_SPACING 에 배치. 마지막 slot 과
    // 다음 row top 사이가 ENTRY_RESERVE 만큼 확보되어 진입 직선이 보장된다.
    const gapVSep: number[] = gapSlotCount.map((n) =>
      Math.max(MIN_GAP, n * SLOT_SPACING + ENTRY_RESERVE),
    );

    // row y 재계산 (dynamic per-gap vSep). row.y 와 positions의 y 업데이트.
    {
      let currentY2 = marginY;
      let prevType2: 'outer' | 'inner' | 'sub' | null = null;
      rows.forEach((row, i) => {
        const type = rankType(row.rank);
        if (prevType2 && prevType2 !== type) currentY2 += GROUP_GAP;
        prevType2 = type;
        const newCenterY = currentY2 + row.height / 2;
        const dy = newCenterY - row.y;
        if (Math.abs(dy) > 0.001) {
          row.ids.forEach((id) => {
            const pos = positions.get(id);
            if (pos) positions.set(id, { x: pos.x, y: pos.y + dy });
          });
          row.y = newCenterY;
        }
        currentY2 += row.height;
        if (i < rows.length - 1) currentY2 += gapVSep[i] ?? vSep;
      });
    }

    // slot → y 계산: gap[i] 의 top (= row[i] bottom) 기준 (slot+1) * SLOT_SPACING 아래.
    const gapTopY = (gap: number) => rows[gap].y + rows[gap].height / 2;
    const slotY = (gap: number, slot: number) => gapTopY(gap) + (slot + 1) * SLOT_SPACING;

    // areaBounds / subAreaBounds 먼저 계산 (edge path 안에서 label 회피용)
    const computeBounds = (matchIds: string[], pad: number) => {
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      matchIds.forEach((id) => {
        const pos = positions.get(id);
        const n = nodeById.get(id);
        if (!pos || !n) return;
        const left = pos.x - n.width / 2;
        const top = pos.y - n.height / 2;
        const right = pos.x + n.width / 2;
        const bottom = pos.y + n.height / 2;
        if (left < minX) minX = left;
        if (top < minY) minY = top;
        if (right > maxX) maxX = right;
        if (bottom > maxY) maxY = bottom;
      });
      if (!isFinite(minX)) return null;
      return {
        x: minX - pad,
        y: minY - pad,
        width: maxX - minX + pad * 2,
        height: maxY - minY + pad * 2,
      };
    };
    let areaBounds: ReturnType<typeof computeBounds> = null;
    if (areaBox) {
      const innerIds = nodes.filter((n) => n.inArea !== false).map((n) => n.id);
      areaBounds = computeBounds(innerIds, areaBox.pad ?? 22);
    }
    const subAreaBounds: Array<{ id: string; x: number; y: number; width: number; height: number }> = [];
    (subAreas ?? []).forEach((sa) => {
      const matchIds = nodes.filter((n) => n.subAreaId === sa.id).map((n) => n.id);
      const bounds = computeBounds(matchIds, sa.pad ?? 14);
      if (bounds) subAreaBounds.push({ id: sa.id, ...bounds });
    });

    // pinTo override — area_label 같은 노드를 영역 박스 위 가장자리 가운데로 강제
    nodes.forEach((n) => {
      if (n.pinTo === 'area_top' && areaBounds) {
        positions.set(n.id, {
          x: areaBounds.x + areaBounds.width / 2,
          y: areaBounds.y,
        });
      }
      if (n.pinTo === 'sub_top' && subAreaBounds.length > 0) {
        const sab = subAreaBounds[0];
        positions.set(n.id, {
          x: sab.x + sab.width / 2,
          y: sab.y,
        });
      }
    });

    const edgePaths: { from: string; to: string; points: Pos[] }[] = [];
    edges.forEach((e) => {
      if (e.invisible) return;
      if (!ids.has(e.from) || !ids.has(e.to)) return;
      const from = positions.get(e.from);
      const to = positions.get(e.to);
      const fromNode = nodeById.get(e.from);
      const toNode = nodeById.get(e.to);
      if (!from || !to || !fromNode || !toNode) return;

      // 출발/도착 모두 카드 가운데 통일.
      const fromX = from.x;
      const toX = to.x;
      const fromBottom = from.y + fromNode.height / 2;
      const toTop = to.y - toNode.height / 2;

      const pr = rowIdxById.get(e.from)!;
      const cr = rowIdxById.get(e.to)!;

      // 도착은 무조건 위에서 들어와야 하므로 backward / 같은 row 엣지는 그리지 않는다.
      if (cr <= pr) return;

      // 같은 column 인접 row → 직선
      if (cr - pr === 1 && Math.abs(fromX - toX) < 0.5) {
        edgePaths.push({
          from: e.from,
          to: e.to,
          points: [
            { x: fromX, y: fromBottom },
            { x: toX, y: toTop },
          ],
        });
        return;
      }

      const slots = slotOf.get(e) ?? [];
      const slotEntry = (kind: 'enter' | 'exit' | 'adjacent') =>
        slots.find((s) => s.kind === kind);

      if (cr - pr === 1) {
        // 인접 row: parent vertical → slotY → child vertical
        const adj = slotEntry('adjacent');
        const slotYVal = adj
          ? slotY(adj.gap, adj.slot)
          : (fromBottom + toTop) / 2;
        edgePaths.push({
          from: e.from,
          to: e.to,
          points: [
            { x: fromX, y: fromBottom },
            { x: fromX, y: slotYVal },
            { x: toX, y: slotYVal },
            { x: toX, y: toTop },
          ],
        });
        return;
      }

      // multi-row: parent vertical → enter horizontal → lane vertical → exit horizontal → child vertical
      const side = multiRowLaneSide.get(e) ?? 'left';
      const offIdx = multiRowLaneOffset.get(e) ?? 0;
      const laneX =
        side === 'left'
          ? leftLaneStart + offIdx * leftLaneStep
          : rightLaneEnd - offIdx * rightLaneStep;

      const enterEntry = slotEntry('enter');
      const exitEntry = slotEntry('exit');
      const enterY = enterEntry
        ? slotY(enterEntry.gap, enterEntry.slot)
        : rows[pr].y + rows[pr].height / 2 + SLOT_SPACING;
      const exitY = exitEntry
        ? slotY(exitEntry.gap, exitEntry.slot)
        : rows[cr].y - rows[cr].height / 2 - SLOT_SPACING;

      edgePaths.push({
        from: e.from,
        to: e.to,
        points: [
          { x: fromX, y: fromBottom },
          { x: fromX, y: enterY },
          { x: laneX, y: enterY },
          { x: laneX, y: exitY },
          { x: toX, y: exitY },
          { x: toX, y: toTop },
        ],
      });
    });

    const lastRow = rows[rows.length - 1];
    const totalHeight = (lastRow ? lastRow.y + lastRow.height / 2 : 0) + marginY;

    return {
      width: maxWidth,
      height: totalHeight,
      positions,
      edgePaths,
      areaBounds,
      subAreaBounds,
    };
  }, [nodes, edges, maxWidth, hSep, vSep, marginX, marginY, areaBox, subAreas]);

  if (nodes.length === 0) return null;

  return (
    <View style={{ width: layout.width, height: layout.height }}>
      <Svg
        width={layout.width}
        height={layout.height}
        style={StyleSheet.absoluteFillObject}
      >
        <Defs>
          <Marker
            id="arrowhead"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <Path d="M 0 0 L 10 5 L 0 10 Z" fill={EDGE_COLOR} />
          </Marker>
        </Defs>
        {layout.areaBounds ? (
          <Rect
            x={layout.areaBounds.x}
            y={layout.areaBounds.y}
            width={layout.areaBounds.width}
            height={layout.areaBounds.height}
            rx={16}
            ry={16}
            fill={areaBox?.color ?? 'transparent'}
            stroke={areaBox?.dashed ? areaBox.dashColor ?? '#92400e' : 'none'}
            strokeWidth={areaBox?.dashed ? 1.5 : 0}
            strokeDasharray={areaBox?.dashed ? '6 4' : undefined}
          />
        ) : null}
        {layout.subAreaBounds.map((sab) => {
          const sa = subAreas?.find((s) => s.id === sab.id);
          if (!sa) return null;
          return (
            <Rect
              key={sab.id}
              x={sab.x}
              y={sab.y}
              width={sab.width}
              height={sab.height}
              rx={12}
              ry={12}
              fill={sa.color}
              stroke={sa.dashed ? sa.dashColor ?? '#92400e' : 'none'}
              strokeWidth={sa.dashed ? 1.5 : 0}
              strokeDasharray={sa.dashed ? '6 4' : undefined}
            />
          );
        })}
        {layout.edgePaths.map((edge, i) => {
          const d = pointsToRoundedPath(edge.points);
          return (
            <Path
              key={`${edge.from}-${edge.to}-${i}`}
              d={d}
              stroke={EDGE_COLOR}
              strokeWidth={1.5}
              fill="none"
              markerEnd="url(#arrowhead)"
            />
          );
        })}
      </Svg>
      {nodes.map((n) => {
        const pos = layout.positions.get(n.id);
        if (!pos) return null;
        return (
          <View
            key={n.id}
            style={{
              position: 'absolute',
              left: pos.x - n.width / 2,
              top: pos.y - n.height / 2,
              width: n.width,
              height: n.height,
            }}
          >
            {n.render()}
          </View>
        );
      })}
      {areaBox?.label && layout.areaBounds ? (
        <View
          style={{
            position: 'absolute',
            left: layout.areaBounds.x,
            top: layout.areaBounds.y - 12,
            width: layout.areaBounds.width,
            alignItems: 'center',
          }}
          pointerEvents="none"
        >
          <View
            style={{
              backgroundColor: areaBox.labelBg ?? 'rgba(255,255,255,0.85)',
              paddingHorizontal: 14,
              paddingVertical: 4,
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                fontFamily: 'Georgia',
                fontSize: 12,
                color: areaBox.labelTextColor ?? '#1f2937',
                fontWeight: '600',
              }}
            >
              {areaBox.label}
            </Text>
          </View>
        </View>
      ) : null}
      {layout.subAreaBounds.map((sab) => {
        const sa = subAreas?.find((s) => s.id === sab.id);
        if (!sa?.label) return null;
        return (
          <View
            key={`label-${sab.id}`}
            style={{
              position: 'absolute',
              left: sab.x,
              top: sab.y - 12,
              width: sab.width,
              alignItems: 'center',
            }}
            pointerEvents="none"
          >
            <View
              style={{
                backgroundColor: sa.labelBg ?? '#7c4a1a',
                paddingHorizontal: 12,
                paddingVertical: 3,
                borderRadius: 10,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Georgia',
                  fontSize: 11,
                  color: sa.labelTextColor ?? '#fff',
                  fontWeight: '600',
                }}
              >
                {sa.label}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
