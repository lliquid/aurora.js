NODE_PATH ?= ./node_modules
JS_COMPILER = $(NODE_PATH)/uglify-js/bin/uglifyjs
JS_TESTER = $(NODE_PATH)/vows/bin/vows

all: \
	aurora.js \
	aurora.min.js

.INTERMEDIATE aurora.js: \
	src/matrix.js \
	src/graph.js

test: all
	@$(JS_TESTER)

aurora.min.js: aurora.js Makefile
	@rm -f $@
	$(JS_COMPILER) < $< > $@

aurora.js:
	@rm -f $@
	@echo '(function(exports){' > $@
	cat $(filter %.js,$^) >> $@
	@echo '})(this);' >> $@
	@chmod a-w $@

install:
	mkdir -p node_modules
	npm install

clean:
	rm -f aurora*.js