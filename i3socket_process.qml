import QtQuick 2.15
import QtQuick.Controls 2.15
import Qt.labs.process 1.0

Item {
    id: processItem
    
    // Process component to execute shell commands
    Process {
        id: process
        onFinished: {
            console.log("i3 command executed with exit code:", exitCode);
        }
        onErrorOccurred: {
            console.error("Process error:", errorString);
        }
    }

    function startCommand(command) {
        console.log("Executing i3 command:", command);
        process.start("sh", ["-c", command]);
        return true;
    }
}