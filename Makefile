PHONY: clean build proto test build install dev

clean:
	rm -rf ./build
	
install:
	go mod download
	cd ./ui && pnpm install

dev: install 
	# watch all .go files and run examples/base/main.go on change 
	pnpm dlx concurrently "cd ./ui && pnpm dev" "pnpm dlx nodemon --watch . --ext go --exec go run ./examples/base/main.go serve"

build:
	mkdir -p ./build/bin
	cd ./ui && pnpm build

proto:
	protoc --go_out=./models ./models/proto/*.proto 

test:
	go test ./...	