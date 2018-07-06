# Xs and Os LIFF Game

# XsOs LIFF Game Protocol
## Version
3

## Overview

### Terminology
PA = Player A, PB = Player B, SVR = Server

### Architecture
```
+----+                       +-----+                        +----+
|    |  Send `client_msg`    |     |   Send `server_msg`    |    |
|    | --------------------> |     | ---------------------> |    | 
| PA |                       | SVR |                        | PB |
|    | <-------------------- |     | <--------------------- |    |
|    |  Send `server_msg`    |     |   Send `client_msg`    |    |
+----+                       +-----+                        +----+
```
As the diagram above depicted, SVR in charge of forwarding messages between PA and PB.

The `client_msg` is a message sent from one player client to SVR with the message payload to another player client.

SVR then forwards that message payload to another player client by the `server_msg` event.


## Message Payloads
* Base message (all messages shall extend this Base message)
  ```js
  {
    // Int. The protocol version for debugging
    version,
    
    // Int. The messages sequence sent by one player client.
    // This is for another receiver to make sure the right messages order.
    // For each new game session, should start from 0, then 1, 2, 3...
    seq,
    
    // String. Should be the LIFF userId.
    // This is saying this message is from userId
    from,
    
    // String. The LIFF utouId. SVR utilizes this to identify two players in the same chat room.
    utouId,
  }
  ```

* "join" message
  ```js
  {
    // String. Saying this is for joining a game.
    action: "join",

    // String. The LIFF user displayname
    name,

    // String. Optional. The LIFF user picture if available
    imgURL,
  }
  ```

* "start_game" message
  ```js
  {
    // String. Saying this is for starting an new game
    action: "start_game",

    // String. The LIFF user displayname
    name,

    // String. Optional. The LIFF user picture if available
    imgURL,
  }
  ```

* "start_game_ack" message
  ```js
  {
    // String. Saying this is for the acknowledgement of a "start_game"
    action: "start_game_ack",
  }
  ```

* "update_game" message
  ```js
  {
    // Stirng. Saying this is for updating the game state
    action: "update_game",

    // Array<Number>. The game state, for example,
    //   [ -1, 0, 0,
    //      0, 1, 0,
    //      0, 0, -1]
    // means
    //   [ X,  ,  ,
    //      , O,  ,
    //      ,  , X]
    game,
  }
  ```

* "game_over" message
  ```js
  {
    // String. Saying the game is over
    action: "game_over"
  }
  ```

* "leave" message
  ```js
  {
    // String. Saying leaving the game
    action: "leave_game"
  }
  ```

## Handshake
1. PA joins the game room and broadcasts a "join" message.

2. PA listens to the "join" and "start_game" message from another player

3. PB joins the game room and broadcasts a "join" message.

4. PB listens to the "join" and "start_game" message from another player

5. PA receives the "join" message from PB, then removes the "join" and "start_game" message listener, then retrieves PB's info 

6. PA listens to the "start_game_ack" from PB, then sends a "start_game" message to PB

7. PB receives the "start_game" message from PA, then removes the "join" and "start_game" message listener, then retrieves PA's info 

8. PB sends a "start_game_ack" to PA, then enters the Gameplay stage

9. PA receives the "start_game_ack" message from PB, then removes the "start_game_ack" listeners.

10. PA enters the Gameplay stage.

11. The game starts. The handshake done.

#### Known Issues
* What if 2 palyers send and receive the "join" message at the same time? Right now, this version dosen't handle this the case.


## Gameplay
1. PA and PB listen to "update_game" and "game_over" messages

2. PA plays a move locally then sends a "update_game" to PB

3. PB receives the "update_game" message from PA, then updates the game locally

4. PB calculates if the game is over (who wins):
   * If not, go to #5
   * If yes, go to #6

5. PB plays a move locally then sends a "update_game" to PA.
   * Back to #3 for PA

6. PB sends a "game_over" message to PA, then remove "update_game" and "game_over" message listeners

7. PA receives the "game_over" message from PB, then remove "update_game" and "game_over" message listeners

8. PA calculates who wins

9. The game is over


## Leave
1. PA sends a "leave" message to PB, then disconnect the connnection

2. PB receives the "leave" message from PA, then disconnect the connnection

#### Known Issues
* Should we add an ack of the "leave" message so that clients can disconnect after making sure the "leave" message is delivered.