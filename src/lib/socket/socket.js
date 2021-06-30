import Server from "socket.io"
import {CHAT} from '../../utils/constants'
import _ from "lodash"
const PORT   = 3030;

class Socket{
    constructor(server){
        this.server = server
        this.server.close()
        this.server.listen(PORT)
        this.io = Server(this.server, {cors: {
            origins: ["http://localhost:3010"],
            methods: ["GET", "POST"],
          //  pingInterval: pingInterval,
            pingTimeout: 5000,
          }});
        this.connectedSockets = {};
        this.pingInterval = 25 * 1000;
        this.connection = this.connection.bind(this);
    }

    memberTyping(socket) {
        socket.on('member_typing', (data) => {
            socket.broadcast.emit('member_typing', data);
        });
    }

    memberStoppedTyping(socket) {
        socket.on('member_stop_typing', (data) => {
            socket.broadcast.emit('member_stop_typing', data);
        });
    }

    /**
     * method to save user as connected
     */
    saveConnectedUsers(socket){
        socket.on('socket_user_connect', function (data) {
            console.log(data.connectedId);
            if (data.connectedId != null && data.connectedId != "") {
                var user = users.getUser(data.connectedId);
                if (user != null) {
                  users.updateUser(data.connectedId, data.connected, data.socketId);
                } else {
                  users.addUser(data.connectedId, data.connected, data.socketId);
                }
            }
        });
    };

    send(socketId, chatId, data) {
        this.io.to(socketId).emit(CHAT+chatId, data);
    }

    connection() {
        this.io.on("connection", (socket) => {
            console.log('socket connected', socket.id);
            socket.emit('message', 'Hello world')
        });
        
    }
}
export default Socket