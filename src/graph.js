(function(namespace) {

    var Graph = function(directed=false) {
        this.directed = directed        
        this.init()
    }

    _.extend(Graph.prototype, {

        init: function() {

            this.nodes = {}
            this.links = {}
            this.adjlist = {}
        },

        addNode: function(nid, params) {

            if (this.hasNode(nid)) {
                console.info('node ' + nid + 'already in')
                return this
            }

            var n = {id: nid + ''}
            _.extend(n, params)
            this.nodes[n.id] = n
            this.adjlist[nid] = {'ins': [], 'outs': []}

            return this
        },

        removeNode: function(nid) {

            nid = nid + ''

            if (!this.hasNode(nid)) {
                console.info('node not in graph')
                return this
            }

            var n = this.node(nid),
                ins = this.adjlist[nid].ins,
                outs = this.adjlist[nid].outs

            for (var e in ins) {
                this.removeLink(e)
            }
            for (var e in outs) {
                this.removeLink(e)
            }

            delete this.nodes[nid]
            delete this.adjlist[nid]

            return this
        },

        addLink: function(eid, src, tgt, params) {

            if (this.hasLink(eid)) {
                console.info('link ' + eid + 'already in')
                return this
            }

            var e = {
                id: eid + '',
                src: src + '',
                tgt: tgt + ''
            }
            _.extend(e, params)

            this.links[e.id] = e

            if (!this.hasNode(src)) this.addNode(src)
            if (!this.hasNode(tgt)) this.addNode(tgt)

            this.adjlist[src]['outs'].push(eid)
            this.adjlist[tgt]['ins'].push(eid)

            return this
        },

        removeLink: function(eid) {

            eid = eid + ''

            if (!this.hasLink(eid)) {
                console.info('link not in graph')
                return this
            }

            var e = this.link(eid),
                outs = this.adjlist[e.src]['outs'],
                ins = this.adjlist[e.tgt]['ins']

            outs.splice(outs.indexOf(eid), 1)
            ins.splice(ins.indexOf(eid), 1)

            delete this.links[eid]

            return this
        },

        hasNode: function(nid) {
            return this.nodes[nid + ''] !== undefined;
        },

        hasLink: function(arg0, arg1) {
            if (arguments.length === 1) {
                return this.link(arg0) !== undefined ? true:false
            }
            else if (arguments.length === 2) {
                return this.link(arg0, arg1) !== undefined ? true: false
            }
            else {
                return false
            } 
        },

        node: function(nid) {
            return this.nodes[nid + '']
        },

        link: function(arg0, arg1) {

            if (arguments.length === 1) {
                return this.links[arg0 + '']
            }
            else if (arguments.length === 2) {
                var outs = this.outs(arg0 + ''),
                    ins = this.ins(arg0 + ''),
                    rs = [],
                    i = -1
                while (++i < outs.length) {
                    if (this.links[outs[i]]['tgt'] === arg1 + '') {
                        rs.push(outs[i])
                    }
                }
                if (!this.directed) {
                    i = -1
                    while (++i < ins.length) {
                        if (this.links[ins[i]]['src'] === arg1 + '') {
                            rs.push(ins[i])
                        }
                    }
                }

                return rs.length === 0 ? undefined: rs.length ===1 ? rs[0] : rs
            }
            else
                return undefined
        },

        adjacents: function(nid) {
            return this.adjlist[nid]['ins'].concat(this.adjlist[nid]['outs'])
        },

        ins: function(nid) {
            if (!this.directed) {
                console.info('undirected graph')
                return this.adjacents(nid)
            } else {
                return this.adjlist[nid]['ins']
            }
        },

        outs: function(nid) {
            if (!this.directed) {
                console.info('undirected graph')
                return this.adjacents(nid)
            } else {
                return this.adjlist[nid]['outs']
            }
        },

        indegree: function(nid) {
            if (!this.directed) {
                console.info('undirected graph')
                return this.degree(nid)
            } else {
                return this.ins(nid).length
            }
        },

        outdegree: function(nid) {
            if (!this.directed) {
                console.info('undirected graph')
                return this.degree(nid)
            } else {
                return this.outs(nid).length
            }
        },

        degree: function(nid) {
            return this.adjacents(nid).length
        },

        neighbors: function(nid) {

            if (nid === undefined) {return undefined}
            
            var ins = this.ins(nid),
                outs = this.outs(nid),
                nbrs = [],
                i = -1
            
            while(++i < ins.length) {nbrs.push(this.links[ins[i]]['src'])}
            i = -1
            while(++i < outs.length) {nbrs.push(this.links[outs[i]]['tgt'])}

            return _.unique(nbrs)
        },

        getNodes: function(sortBy) {

            var nids = _.keys(this.nodes),
                self = this

            if (sortBy === undefined) {
                return nids
            }

            nids.sort(function(n0, n1) {
                n0 = self.nodes[n0]
                n1 = self.nodes[n1]

                var k = -1
                while(++k < sortBy.length) {
                    if (n0[sortBy[k]] > n1[sortBy[k]]) {
                        return -1
                    }
                    else if (n0[sortBy[k]] < n1[sortBy[k]]) {
                        return 1
                    }
                    else {
                        continue
                    }
                }

                return 0

            })

            return nids
        },

        getLinks: function() {
            return _.keys(this.links)
        }


    })

    _.extend(Graph.prototype, {

        //function for loading json file exported by networkx
        loadNXJSON: function(json) {

            var nodes = json.nodes,
                links = json.links,
                i = -1

            while(++i < nodes.length) {
                this.addNode(nodes[i].id, nodes[i])
            }

            i = -1
            while(++i < links.length) {
                this.addLink(i, nodes[links[i].source].id, nodes[links[i].target].id, links[i])
            }

        }

    })

    //
    _.extend(Graph.prototype, {

        adjmatrix: function(nids, weight=undefined) {

            var n = nids.length,
                mat = matrix.zeros(n, n),
                i = -1,
                j = -1,
                k = -1,
                sum = 0

            while (++i < n) {
                j = -1
                while(++j < n) {
                    var e = this.link(nids[i], nids[j])
                    if (_.isArray(e)) {
                        if (weighted === undefined) {
                            mat[i][j] = e.length
                        }
                        else {
                            mat[i][j] = _.reduce(e, (mem, x)=> mem + this.link(x)[weight], 0)
                        }
                    }
                    else if (e !== undefined) {
                        if (weighted === undefined) {
                            mat[i][j] = 1
                        }
                        else {
                            mat[i][j] = this.link(e)[weight]
                        }
                    }
                    else {
                        continue
                    }
                }

            }

            return mat
        },

        //laplacian matrix
        lplmatrix: function(nids, weight=undefined) {

            var mat = this.adjmatrix(nids, weight),
                rowsum = [],
                n = nids.length,
                i = -1,
                j = -1,
                sum = 0

            while(++i < n) {
                j = -1
                sum = 0.0
                while(++j < n) {
                    sum += mat[i][j]
                }
                rowsum.push(sum)
            }

            i = -1
            while(++i < n) {
                mat[i][i] = rowsum[i]
            }

            i = -1
            while(++i < n) {
                j = -1
                while(++j < n) {
                    if (j!== i) {
                        mat[i][j] = - mat[i][j]
                        mat[j][i] = - mat[j][i]
                    }

                }
            }

            return mat
        },

        fiedlerVector: function(weight=undefined) {

            var nids = this.getNodes(),
                lplm = this.lplmatrix(nids, weight),
                eigen = matrix.eigen(lplm)

            var rs = {},
                i = -1
            while (++i < nids.length) {
                rs[nids[i]] = eigen.V[eigen.IDX][i]
            }

            return rs
        }        

    })

    _.extend(Graph.prototype, {

        
        cliques: function() {



        }






    })

    _.extend(Graph.prototype, Backbone.Events)

    namespace.Graph = Graph

})(window)

