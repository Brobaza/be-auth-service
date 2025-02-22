protoc --plugin=protoc-gen-ts_proto="D:.\node_modules\.bin\protoc-gen-ts_proto.cmd" --ts_proto_out=./ --ts_proto_opt=nestJs=true ./proto/*.proto

// * auth
protoc --plugin=protoc-gen-ts_proto=".\node_modules\.bin\protoc-gen-ts_proto.cmd" --proto_path=./proto --ts_proto_out=./libs/common/modules --ts_proto_opt=nestJs=true ./proto/auth.service.proto

// * user
protoc --plugin=protoc-gen-ts_proto=".\node_modules\.bin\protoc-gen-ts_proto.cmd" --proto_path=./proto --ts_proto_out=./proto --ts_proto_opt=nestJs=true ./proto/user.service.proto

// * mail
protoc --plugin=protoc-gen-ts_proto=".\node_modules\.bin\protoc-gen-ts_proto.cmd" --proto_path=./proto --ts_proto_out=./proto --ts_proto_opt=nestJs=true ./proto/mail.service.proto

// * chat
protoc --plugin=protoc-gen-ts_proto=".\node_modules\.bin\protoc-gen-ts_proto.cmd" --proto_path=./proto --ts_proto_out=./libs/common/modules --ts_proto_opt=nestJs=true ./proto/chat.service.proto

// * all
protoc --plugin=protoc-gen-ts_proto=".\node_modules\.bin\protoc-gen-ts_proto.cmd" --proto_path=./proto --ts_proto_out=./libs/common/modules --ts_proto_opt=nestJs=true ./proto/*.service.proto

// * test gen
protoc --plugin=protoc-gen-ts_proto=".\node_modules\.bin\protoc-gen-ts_proto.cmd" --proto_path=./proto --ts_proto_out=./proto --ts_proto_opt=nestJs=true ./proto/auth.service.proto
