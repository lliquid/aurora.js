(function(namespace) {

    var MatrixView = function(el, config, graph) {
        this.container = d3.select(el).append('g')
        this.config = _.extend({}, config)
        this.graph = graph
    }

    _.extend(MatrixView.prototype, {

        layout: function() {
            var g = this.graph,
                nids = g.getNodes()
            if (nids.length <= 2) {
                return nids
            }
            var fv = g.fiedlerVector()
            return _.sortBy(nodes, id=>fv[id])
        },

        render: function() {

            var self = this,
                c = this.container,
                p = this.config,
                nids = this.layout()

            var rows = c.selectAll('.row')
                .data(nids)

            rows.enter().append('g')
                .attr('class', 'row')

            rows.each(function(nid, i) {

                var cells = d3.select(this)
                    .selectAll('.cell')
                    .data(g.adjacents(nid))

                cells.enter().append('rect')
                    .attr('class', 'cell')

                cells.attr('x', function(e, j) {return nodeIndices[graph.neighbor(n, e)] * (size + padding);})
                    .attr('y', function(e, j) {return i * (size + padding);})
                    .attr('width', size).attr('height', size)
                    .attr('fill', function(e, j) {
                        var w = 1
                        if (graph.link(e).attrs[colorField] !== undefined) {
                            w = graph.link(e).attrs[colorField]
                        }
                        var cidx = Math.floor((w - range.begin) / range.interval * colorRamp.length)
                        cidx = (cidx >= colorRamp.length ? (colorRamp.length - 1): cidx)
                        cidx = cidx < 0 ? 0:cidx
                        return "#" + colorRamp[cidx].toHex()
                    })

            })


            var labels = canvas.selectAll('.label')
                .data(nodes)

            labels.enter().append('text')
                .attr('class', 'node_label')
                .text(function(nid){return labelField === 'id' ? nid : graph.getNodeAttr(labelField, nid);})

            labels.attr('x', nodes.length * (size + padding) + size * 2)
                .attr('y', function(d, i) {return i * (size + padding) + size;})

        }
    })

    namespace.MatrixView = MatrixView

})(window)

