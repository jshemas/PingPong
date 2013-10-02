# Run all tests (install dependencies first)
tests:
	@echo "Installing dependencies..."
	cd app; \
		npm install
	cd ..;
	@echo "Running tests..."
	@./app/node_modules/.bin/mocha \
		./spec/index.spec.js