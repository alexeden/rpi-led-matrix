#include <cmath>

typedef struct tEdge {
	int yUpper;
	float x_intersect;
	float dxPerScan;
	struct tEdge* next;
} TEdge;

typedef struct {
	int x;
	int y;
} dcPt;

void fill_scan(int scan_i, TEdge* active) {
	TEdge* p1;
	TEdge* p2;
	int i;
	p1 = active->next;
	while (p1) {
		p2 = p1->next;
		for (i = p1->x_intersect; i < p2->x_intersect; i++) {
			// set_pixel((int) i, scan_i);
		}
		p1 = p2->next;
	}
}

void scan_fill(int cnt, uint32_t height, dcPt* pts) {
	TEdge* edges[height];
	TEdge* active;
	for (auto i = 0; i < height; i++) {
		edges[i]	   = (TEdge*) malloc(sizeof(TEdge));
		edges[i]->next = NULL;
	}
	build_edge_list(cnt, pts, edges);
	active		 = (TEdge*) malloc(sizeof(TEdge));
	active->next = NULL;
	for (auto scan_i = 0; scan_i < height; scan_i++) {
		build_active_list(scan_i, active, edges);
		if (active->next) {
			fill_scan(scan_i, active);
			update_active_list(scan_i, active);
			resort_active_list(active);
		}
	}
	// free
}

void build_edge_list(int cnt, dcPt* pts, TEdge* edges[]) {
	TEdge* edge;
	dcPt v1;
	dcPt v2;
	int i;
	int yPrev = pts[cnt - 2].y;
	v1.x	  = pts[cnt - 1].x;
	v1.y	  = pts[cnt - 1].y;
	for (i = 0; i < cnt; i++) {
		v2 = pts[i];
		// non-horizontal line
		if (v1.y != v2.y) {
			edge = (TEdge*) malloc(sizeof(TEdge));
			// edge going up
			if (v1.y < v2.y) {
				make_edge_rec(v1, v2, y_next(i, cnt, pts), edge, edges);
			}
			// edge going down
			else {
				make_edge_rec(v1, v2, yPrev, edge, edges);
			}
		}
		yPrev = v1.y;
		v1	  = v2;
	}
}

int y_next(int k, int cnt, dcPt* pts) {
	int j;

	if ((k + 1) > (cnt - 1))
		j = 0;
	else
		j = k + 1;

	while (pts[k].y == pts[j].y)
		if ((j + 1) > (cnt - 1))
			j = 0;
		else
			j++;

	return pts[j].y;
}
void delete_after(TEdge* q) {
	TEdge* p = q->next;
	q->next	 = p->next;
	free(p);
}

/**
 * Store lower-y coordinate and inverse slope for each edge. Adjust and store
 * upper-y coordinate for edges that are the lower member of a monotonically
 * increassing or decreasing pair of edges.
 */
void make_edge_rec(dcPt lower, dcPt upper, int yComp, TEdge* edge, TEdge* edges[]) {
	edge->dxPerScan	  = (float) (upper.x - lower.x) / (upper.y - lower.y);
	edge->x_intersect = lower.x;
	if (upper.y < yComp)
		edge->yUpper = upper.y - 1;
	else
		edge->yUpper = upper.y;

	insert_edge(edges[lower.y], edge);
}

void resort_active_list(TEdge* active) {
	TEdge* q;
	TEdge* p	 = active->next;
	active->next = NULL;
	while (p) {
		q = p->next;
		insert_edge(active, p);
		p = q;
	}
}

/**
 * Inserts edge into a list of edges in order of increasing x_intersect.
 */
void insert_edge(TEdge* list, TEdge* edge) {
	TEdge* p;
	TEdge* q = list;
	p		 = q->next;
	while (p != NULL)
		if (edge->x_intersect < p->x_intersect)
			p = NULL;
		else {
			q = p;
			p = p->next;
		}

	edge->next = q->next;
	q->next	   = edge;
}

void build_active_list(int scan, TEdge* active, TEdge* edges[]) {
	TEdge* p;
	TEdge* q;
	p = edges[scan]->next;
	while (p) {
		q = p->next;
		insert_edge(active, p);
		p = q;
	}
}

/**
 * Delete completed edges and update the x-intersect of the other edges.
 */
void update_active_list(int scan, TEdge* active) {
	TEdge* q = active;
	TEdge* p = active->next;
	while (p) {
		if (scan >= p->yUpper) {
			p = p->next;
			delete_after(q);
		}
		else {
			p->x_intersect = p->x_intersect + p->dxPerScan;
			q			   = p;
			p			   = p->next;
		}
	}
}
