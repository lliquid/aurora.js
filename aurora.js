(function(exports){
/**
 * Created by panpan (xpp2007@gmail.com) on 4/16/14.
 */
matrix = function () {
    var m = {
        version: '0.0',
        consts: {
            ZERO: 1e-9
        },
        //initialize a zero matrix with m rows and n columns
        zeros : function (m, n) {
            var mat = [];
            for (var i= 0; i < m; i++) {
                var row = [];
                mat.push(row);
                for (var j = 0; j < n; j++) {
                    row.push(0);
                }
            }
            return mat;
        },
        identity: function(m) {
            var mat = this.zeros(m, m);
            for (var i = 0; i < m; i++) {
                mat[i][i] = 1;
            }
            return mat;
        },
        trace: function(mat) {
            var tr = [];
            for (var i = 0, ii = mat.length; i < ii; i++) {
                tr.push(mat[i][i]);
            }
            return tr;
        },
        col: function(j, mat) {
            var entries = [];
            for (var i = 0, ii = mat.length; i < ii; i ++) {
                entries.push(mat[i][j]);
            }
            return entries;
        },

        //return eigenvectors and eigenvalues
        //depend on science.lin.decompose routine in the package science.js
        //https://github.com/jasondavies/science.js/
        eigen: function(mat) {

            var decomposefunc = science.lin.decompose();
            var rs = decomposefunc.call(null, mat);
            var es = this.trace(rs.D),
                o = _.sortBy(_.range(0, es.length), function(i) {return es[i]});
            var ev = [];
            for (var i = 0, ii = o.length; i < ii; i ++) {
                ev.push(this.col(o[i], rs.V));
            }
            es.sort()
            //IDX is the first nonzero eigenvalue
            var i = 0;
            for (ii = es.length; i < ii; i ++) {
                if (Math.abs(es[i]) > this.consts.ZERO)
                    break;
            }

            return {E : es, V: ev, IDX: i};
            
        },

        find_maximum_rectangle: function(mat) {
            //find rectangle with maximum area in the matrix
            var nrows = m.get_num_rows(mat),
                ncols = m.get_num_cols(mat),
                s = m.zeros(nrows, ncols),
                i0 = 0,
                j0 = 0,
                height = 0,
                width = 0;

            if (nrows == 0 || ncols == 0) return null;

            //histogram
            for (var i=0; i < nrows; i++) {
                var cnt = 0;
                for (var j=ncols-1; j >= 0; j--) {
                    if (mat[i][j] > 0)
                        cnt ++;
                    else
                        cnt = 0;
                    s[i][j] = cnt;
                }
            }

            var stack = [],
                area = 0;

            //maximum rectangle area in a histogram
            for (var j=0; j < ncols; j++) {
                var i = 0;
                while(i < nrows) {
                    if(stack.length == 0 || s[stack[stack.length-1]][j] <= s[i][j])
                        stack.push(i++);
                    else {
                        var tp = stack[stack.length-1];
                        stack.pop();
                        //stack is empty, all previous values larger than s[i][j]
                        //tp is the most previous one
                        if (stack.length == 0) {
                            if (i * s[tp][j] > area) {
                                area = i * s[tp][j];
                                i0 = tp;
                                j0 = j;
                                width = s[tp][j];
                                height = i;
                            }
                        }
                        else {
                            if ((i - stack[stack.length-1] -1) * s[tp][j] > area) {
                                area = (i - stack[stack.length-1] -1) * s[tp][j];
                                i0 = stack[stack.length-1] + 1;
                                j0 = j;
                                width = s[tp][j];
                                height = i - stack[stack.length-1] -1;
                            }
                        }
                    }
                }

                while (stack.length > 0) {
                   var tp = stack[stack.length-1];
                    stack.pop();
                    if (stack.length == 0) {
                        if (i * s[tp][j] > area) {
                            area = i * s[tp][j];
                            i0 = tp;
                            j0 = j;
                            width = s[tp][j];
                            height = i;
                        }
                    }
                    else {
                        if ((i - stack[stack.length-1] -1) * s[tp][j] > area) {
                            area = (i - stack[stack.length-1] -1) * s[tp][j];
                            i0 = stack[stack.length-1] + 1;
                            j0 = j;
                            width = s[tp][j];
                            height = i - stack[stack.length-1] -1;
                        }
                    }
                }
            }

            return {i0: i0, j0: j0, height: height, width: width};
        },
        clean_rectangle: function(i0, j0, height, width, mat) {
            for (var i=i0, ii=height + i0; i < ii; i++) {
                for (var j=j0, jj=width + j0; j < jj; j++) {
                    mat[i][j] = 0;
                }
            }
            return mat;
        },
        is_zero: function(mat) {
            var flag = true;
            for (var i= 0, ii= m.get_num_rows(mat); i < ii; i++) {
                for (var j= 0, jj= m.get_num_cols(mat); j < jj; j++) {
                    if (mat[i][j] != 0)
                        flag = false;
                }
            }
            return flag;
        },
        //find the nearest empty entry in the matrix with a spiral order
        find_nearest_empty_entry: function (i, j, mat) {
            if (i<0||i>=m.get_num_rows(mat)||j<0||j>=m.get_num_cols(mat)) {
                var ii = i,
                    jj = j;
                if (i < 0) ii = 0;
                if (i>= m.get_num_rows(mat)) ii = m.get_num_rows(mat) - 1;
                if (j < 0) jj = 0;
                if (j>= m.get_num_cols(mat)) jj = m.get_num_cols(mat) - 1;
                return {i: ii, j: jj};
            }
            var ii = i,
                jj = j,
                k = 0;
            while (mat[ii][jj] != 0) {
                if (ii == i - k && jj == j - k ) {
                    ii -= 1;
                    k += 1;
                }
                else if (ii == i - k && jj < j + k) {
                    jj += 1;
                }
                else if (jj == j + k && ii < i + k) {
                    ii += 1;
                }
                else if (ii == i + k && jj > j - k) {
                    jj -= 1;
                }
                else if (jj == j - k && ii > i - k) {
                    ii -= 1;
                }

                if (ii<0||ii>=m.get_num_rows(mat)||jj<0||jj>=m.get_num_cols(mat)) {
                    if (ii < 0) ii = 0;
                    if (ii>= m.get_num_rows(mat)) ii = m.get_num_rows(mat) - 1;
                    if (jj < 0) jj = 0;
                    if (jj>= m.get_num_cols(mat)) jj = m.get_num_cols(mat) - 1;
                    return {i: ii, j: jj};
                }

            }
            return {i: ii, j: jj};
        },
        get_num_rows: function(mat) {
            return mat.length;
        },
        get_num_cols: function(mat) {
            if (mat.length == 0)
                return 0;
            else
                return mat[0].length;
        },
        to_string: function(mat) {
            var str = '';
            var nrows = m.get_num_rows(mat),
                ncols = m.get_num_cols(mat);
        },
        //test spiral
        test_spiral: function() {
            var mat = matrix.zeros(7, 7);
            for (var i = 0, ii = 36; i < ii; i++) {
                var entry = m.find_nearest_empty_entry(3, 3, mat);
                mat[entry.i][entry.j] = 1;
                console.info(entry);
            }
        },
        //test finding maximum rectangle
        //passed simple test, should be ok
        test_max_rectangle: function() {
            var mat = matrix.zeros(8, 8);
            for (var i = 0, ii = 30; i < ii; i++) {
                var entry = m.find_nearest_empty_entry(3, 3, mat);
                mat[entry.i][entry.j] = 1;
            }
            console.info(mat);
            m.find_maximum_rectangle(mat);
        }
    };
    return m;
}();
/*
 created by panpan xpp2007@gmail.com
 */

Graph = function() {

    var self = this;

    this.empty = function() {

        this.nodes = [];
        this.links = [];
        this.adjlinks = [];

        this.nodeIdx = {};
        this.linkIdx = {};

        this.invalidNodeIndices = [];
        this.nextNodeIdx = 0;
        this.invalidEdgeIndices = [];
        this.nextEdgeIdx = 0;

        return this;
    };

    this.empty();

};

_.extend(Graph.prototype, {

    addNode: function(nid, params) {

        if (this.node(nid) != null) { //check if nid is already in
            console.info('node ' + nid + 'already in');
            return;
        }

        var n = {
            id: nid + '',
            name: '',
            attrs: {}
        };

        var nidx = -1;

        if (this.invalidNodeIndices.length == 0) {
            this.nodes.push(undefined);
            this.adjlinks.push(undefined);
            nidx = this.nextNodeIdx;
            this.nextNodeIdx ++;
        } else {
            nidx = this.invalidNodeIndices.pop();
        }
        this.nodes[nidx] = n;
        this.adjlinks[nidx] = [];
        this.nodeIdx[nid] = nidx;
        this.updateNodeAttrs(params, nid);
        return this;
    },


    addLink: function(eid, source, target, params) {

        if (this.link(eid) != null) {
            console.info('link ' + eid + 'already in');
            return;
        }

        var e = {
            id: eid + '',
            source: source + '',
            target: target + '',
            attrs: {}
        };

        if (this.node(source) == undefined) {
            this.addNode(source);
        }
        if (this.node(target) == undefined) {
            this.addNode(target);
        }

        var eidx = -1;

        if (this.invalidEdgeIndices.length == 0) {
            this.links.push(null);
            eidx = this.nextEdgeIdx;
            this.nextEdgeIdx ++;
        } else {
            eidx = this.invalidEdgeIndices.pop();
        }

        var sidx = this.nodeIdx[source],
            tidx = this.nodeIdx[target];

        this.links[eidx] = e;
        this.linkIdx[eid] = eidx;

        this.adjlinks[sidx].push(eid);
        this.adjlinks[tidx].push(eid);

        this.updateLinkAttrs(params, eid);
        return this;
    },

    removeNode:  function(nid) {

        if (!this.hasNode(nid)) {
            console.info("node " + nid + " not exist");
            return;
        }

        //remove links first
        var adjs=this.adjacents(nid).slice(0);
        for (var i= 0; i< adjs.length; i++) {
            this.removeLink(adjs[i]);
        }

        var nidx = this.nodeIdx[nid];
        this.invalidNodeIndices.push(nidx);
        this.nodes[nidx] = undefined;
        this.nodeIdx[nid] = undefined;
        this.adjlinks[nidx] = undefined;

        return this;
    },

    removeLink: function(arg0, arg1) {

        var e = undefined,
            eidx = -1,
            src = undefined,
            tgt = undefined,
            eid = undefined;

        if (arguments.length == 1) {
            e = this.link(arg0);
            eidx = this.linkIdx[arg0];
        }
        else if (arguments.length >= 2) {
            e = this.link(arg0, arg1);
            eidx = this.linkIdx[e.id];
        }

        src = e.source;
        tgt = e.target;

        this.invalidEdgeIndices.push(eidx);
        this.linkIdx[eid] = undefined;
        this.links[eidx] = undefined;
        //remove from adjacency list
        var s = this.adjlinks[this.nodeIdx[e.source]],
            t = this.adjlinks[this.nodeIdx[e.target]];

        s.splice(s.indexOf(e.id), 1);
        t.splice(t.indexOf(e.id), 1);

        return this;
    },

    node: function(nid) {
            
        return (this.nodeIdx[nid] == undefined || this.nodes[this.nodeIdx[nid]] ==  undefined) ? null: this.nodes[this.nodeIdx[nid]];
    },

    hasNode: function(nid) {
        return this.node(nid) !== null;
    },

    //overloaded function link
    link: function(arg0, arg1) {
        if (arguments.length == 1) {
            return (this.linkIdx[arg0] == undefined || this.links[this.linkIdx[arg0]] == undefined) ? null: this.links[this.linkIdx[arg0]];
        }
        else if (arguments.length == 2) { //nid0, nid1
            var nlinks = this.adjacents(arg0),
                rs = [];
            for (var i= 0, ii = nlinks.length; i < ii; i ++) {
                if (this.link(nlinks[i]) && (this.link(nlinks[i]).source == arg0 && this.link(nlinks[i]).target == arg1
                    || this.link(nlinks[i]).source == arg1 && this.link(nlinks[i]).target == arg0)) {
                    if(rs.indexOf(nlinks[i]) == -1)
                        rs.push(nlinks[i]);
                }
            }
            if (rs.length == 1) {
                return rs[0];
            }
            else if (rs.length == 0) {
                return null;
            }
            else {
                return rs;
            }
        }
        else
            return undefined;
    },

    hasLink: function(arg0, arg1) {
        var link = this.link(arg0, arg1);
        return link !== null && link !== undefined;
    },

    neighbor: function(nid, eid) {
        if (nid == this.link(eid).source)
            return this.link(eid).target;
        else
            return this.link(eid).source;
    },

    adjacents: function(nid) {
        return this.adjlinks[this.nodeIdx[nid]];
    },

    neighbors: function(nid) {

        var eids = this.adjacents(nid),
            nbrs = [];

        for (var i= 0, ii=eids.length; i < ii; i ++) {
            var nbr = this.neighbor(nid, eids[i]);
            if (nbrs.indexOf(nbr) == -1)
                nbrs.push(nbr);
        }

        return nbrs;
    },

    degree: function(nid, weight) {
        if (arguments.length == 1) {
            return this.adjacents(nid).length;
        }
        else {
            var adjlinks = this.adjacents(nid),
                wsum = 0;
            for (var i = 0, ii = adjlinks.length; i < ii; i++) {
                wsum += this.getLinkAttr('w', adjlinks[i]);
            }
            return wsum;
        }
    },

    precedessors: function(nid) { },
    successors: function (nid) { },

    indegree: function(nid) { },
    outdegree: function(nid) { },


    getNodes: function() {
        var nids = [],
            invalids = _.sortBy(this.invalidNodeIndices);
        for (var i = 0, ii = this.nodes.length, j = 0; i < ii; i ++) {
            if (j < invalids.length && i < invalids[j] || j >= invalids.length) {
                nids.push(this.nodes[i].id);
            }
            else {
                j ++;
            }
        }
        return nids;
    },

    getLinks: function() {
        var eids = [],
            invalids = _.sortBy(this.invalidEdgeIndices);
        for (var i = 0, ii = this.links.length, j = 0; i < ii; i ++) {
            if (j < invalids.length && i < invalids[j] || j >= invalids.length) {
                eids.push(this.links[i].id);
            }
            else {
                j ++;
            }
        }
        return eids;
    },

    getNodeAttr: function(attr, nid) {
        return this.node(nid).attrs[attr];
    },

    getNodeAttrs: function(attrs, nid) {
        var rs = {};
        for (var i= 0, ii=attrs.length; i < ii; i ++) {
            rs[attrs[i]] = this.getNodeAttr(attrs[i], nid);
        }
        return rs;
    },

    getLinkAttr: function(attr, eid) {
        return this.link(eid).attrs[attr];
    },

    hasNodeAttr: function(attr) {
        var nids = this.getNodes();
        if (nids.length == 0) {
            return false;
        }
        else {
            for (var i = 0; i < nids.length; i ++) {
                if (this.getNodeAttr(attr, nids[i]) != undefined) {
                    return true;
                }

            }
            return false;
        }
    },

    getAttrVals: function(attr) {

        var nids = this.getNodes(),
            i = -1,
            vals = []

        while(++i < nids.length) {
            vals.push(this.getNodeAttr(attr, nids[i]))
        }

        vals = _.uniq(vals)

        if (vals.indexOf(undefined) > -1) {
            vals.splice(vals.indexOf(undefined), 1)
        }

        return vals

    },

    bfs: function(nid, dlimit) {

        var visited = d3.set([nid]),
            distances = d3.map(),
            queue = [nid];

        distances.set(nid, 0);

        while (queue.length > 0) {
            var n0 = queue.shift(),
                d = distances.get(n0);
            if (d >= dlimit)
                continue;
            var nbrs = this.neighbors(n0);
            for (var i=0, ii=nbrs.length; i<ii; i++) {
                if (!visited.has(nbrs[i])) {
                    queue.push(nbrs[i]);
                    visited.add(nbrs[i]);
                    distances.set(nbrs[i], d + 1);
                }
            }
        }

        return distances;
    },

    updateNodeAttrs: function(params, nid) {

        var n = this.node(nid);
        params = params || {};
        for (var k in params) {
            if (params.hasOwnProperty(k)) {
                switch (k) {
                    case 'id': break;
                    case 'name': n.name = params[k]; break;
                    default :n.attrs[k] = params[k]; break;
                }
            }
        }
    },

    updateLinkAttrs: function(params, eid) {

        var e = this.link(eid);
        params = params || {};
        for (var k in params) {
            if (params.hasOwnProperty(k)) {
                switch (k) {
                    case 'id': break;
                    case 'source': break;
                    case 'target': break;
                    default :e.attrs[k] = params[k]; break;
                }
            }
        }
    },

    //adjacency matrix based on the given order
    adjacencyMatrix: function(nids, weighted) {

        var mat = matrix.zeros(nids.length, nids.length);

        for (var i = 0, ii = nids.length; i < ii; i++) {
            for (var j = i + 1, jj = nids.length; j < jj; j++) {
                var e = this.link(nids[i], nids[j]);
                if (_.isArray(e)) {
                    if (weighted == undefined || weighted == false) {
                        mat[j][i] = mat[i][j] = e.length;
                    }
                    else {
                        var sum = 0;
                        for (var k = 0; k < e.length; k ++) {
                            sum += this.getLinkAttr('weight', e[k]);
                        }
                        mat[j][i] = mat[i][j] = sum;
                    }
                }
                else if (e != null){
                    if (weighted == undefined || weighted == false) {
                        mat[j][i] = mat[i][j] = 1;
                    }
                    else {
                        mat[j][i] = mat[i][j] = this.getLinkAttr('weight', e);
                    }
                }
                else { }
            }
        }

        return mat;
    },

    //get attributes shared by nodes in a partition
    attributes: function(partition) {

        var _this = this;

        var nids = _this.getNodes().filter(function(nid) {
            return _this.getNodeAttr('bipartite', nid) == partition || _this.getNodeAttr('bipartite', nid) == partition.toString();
        })

        if (nids.length == 0) {
            return []
        }

        var i = 0,
            attrs = _.keys(_this.node(nids[i]).attrs);

        while(++i < nids.length) {
            attrs = _.intersection(attrs, _.keys(_this.node(nids[i]).attrs));
        }

        return attrs;
    },

    info: function() {
        return '#nodes = ' + this.nodes.length + '; ' + '#links = ' + this.links.length;
    }

});



//load json graph data exported by networkx
_.extend(Graph.prototype, {

    loadJSON: function(data) {

        for (var i = 0, ii = data.nodes.length; i < ii; i++) {
            this.addNode(data.nodes[i].id, data.nodes[i]);
        }

        for (var i = 0, ii = data.links.length; i < ii; i++) {
            this.addLink(i,
                data.nodes[data.links[i].source].id,
                data.nodes[data.links[i].target].id
            )
            this.updateLinkAttrs(data.links[i], i)
        }

    }

});


//utility functions for bipartite graphs
_.extend(Graph.prototype, {

    //TODO weighted projection DONE
    project: function(nodes, weighted) {

        var g = new Graph();
        var nbrs = {};

        for (var i = 0; i < nodes.length; i ++) {
            g.addNode(nodes[i]);
            nbrs[nodes[i]] = this.neighbors(nodes[i]);
        }

        for (var i = 0; i < nodes.length; i ++) {
            for (var j = 0; j < nodes.length; j ++) {
                var nbrIntersectionCnt = _.intersection(nbrs[nodes[i]], nbrs[nodes[j]]).length;
                if (nbrIntersectionCnt > 0) {
                    g.addLink(i * nodes.length + j, nodes[i], nodes[j], {weight: nbrIntersectionCnt});
                }
            }
        }

        return g;
    }

});

_.extend(Graph.prototype, {

    //TODO MUST include weight in the adjacency matrix
    laplacianMatrix: function(nids, weighted) {

        var mat = this.adjacencyMatrix(nids, weighted),
            rowsum = [];

        for (var i = 0, ii = nids.length; i < ii; i++) {
            var sum = 0.0;
            for (var j = 0, jj = nids.length; j < jj; j ++) {
                sum += mat[i][j];
            }
            rowsum.push(sum);
        }

        for (var i = 0, ii = nids.length; i < ii; i++) {
            mat[i][i] = rowsum[i];
        }

        for (var i = 0, ii = nids.length; i < ii; i++) {
            for (var j = i, jj = nids.length; j < jj; j ++) {
                mat[i][j] = - mat[i][j];
                mat[j][i] = - mat[j][i];
            }
        }


        return mat;
    },

    fiedlerVector: function(weighted) {

        var nodes = this.getNodes();
        var lapMat = this.laplacianMatrix(nodes, weighted);
        var eigen = matrix.eigen(lapMat);

        var rs = {};
        for (var i = 0; i < nodes.length; i ++) {
            rs[nodes[i]] = eigen.V[eigen.IDX][i];
        }

        return rs;
    }
});


_.extend(Graph.prototype, {

    aggregate: function(params) {

        var lblFld = params.labelField,
            attrFlds = params.attrFields,
            nids = this.getNodes(),
            eids = this.getLinks()

        var cg = new Graph()

        for (var i = 0; i < nids.length; i++) {

            var node = this.node(nids[i]),
                gid = node.attrs[lblFld],
                attrs = this.getNodeAttrs(attrFlds || [], node.id) 

            if (!cg.hasNode(gid)) {
                cg.addNode(gid, { children: [] })
                cg.updateNodeAttrs(attrs, gid)
            }

            cg.node(gid).attrs['children'].push(node.id)
        }

        for (var i = 0; i < eids.length; i++) {
            var link = this.link(eids[i]),
                src = this.node(link.source),
                tgt = this.node(link.target),
                gid_src = src.attrs[lblFld],
                gid_tgt = tgt.attrs[lblFld]

            if (!cg.hasLink(gid_src, gid_tgt)) {
                cg.addLink(gid_src + '_' + gid_tgt, gid_src, gid_tgt, {children: []});
            }

            cg.link(gid_src + '_' + gid_tgt).attrs['children'].push(link.id)

        }

        return cg;

    }

})


_.extend(Graph.prototype, {

        bundles: function(nids) {

        var mat = this.adjacencyMatrix(nids),
            bdls = [];

        //matrix
        for (var i = 0, ii = nids.length; i < ii; i++) {
            //fill in diagonal entries
            mat[i][i] = 1;
        }

        //detect rectangle areas and check for rectangles like in issue01.png
        while (!matrix.is_zero(mat)) {
            var rect = matrix.find_maximum_rectangle(mat);
            if (rect == null
                || (rect.height == 0 && rect.width == 0)
                || (rect.height == 1 && rect.width == 1))
                break;

            if (rect.height == 1 && rect.width > 1) {
                if (rect.i0 == rect.j0) {
                    rect.j0 += 1;
                    rect.width -= 1;
                }
                else {
                    if (rect.i0 == rect.j0 + rect.width - 1) {
                        rect.width -= 1;
                    }
                }
            }

            if (rect.width == 1 && rect.height > 1) {
                if (rect.i0 == rect.j0) {
                    rect.i0 += 1;
                    rect.height -= 1;
                }
                else {
                    if (rect.j0 == rect.i0 + rect.height - 1) {
                        rect.height -= 1;
                    }
                }
            }

            if (rect.height > rect.width) {
                bdls.push({
                    i0: rect.j0,
                    i1: rect.j0 + rect.width - 1,
                    j0: rect.i0,
                    j1: rect.i0 + rect.height - 1
                });
            }
            else {
                bdls.push({
                    i0: rect.i0,
                    i1: rect.i0 + rect.height - 1,
                    j0: rect.j0,
                    j1: rect.j0 + rect.width - 1
                });
            }

            matrix.clean_rectangle(rect.i0, rect.j0, rect.height, rect.width, mat);
            matrix.clean_rectangle(rect.j0, rect.i0, rect.width, rect.height, mat);
        }

        //check for size-one rectangles
        for (var i = 0, ii = nids.length; i < ii; i++) {
            for (var j = i, jj = nids.length; j < jj; j++) {
                if (mat[i][j] != 0 && i != j) {
                    bdls.push({
                        i0: i,
                        i1: i,
                        j0: j,
                        j1: j
                    });
                }
            }
        }

        return bdls;
    }

});})(this);
