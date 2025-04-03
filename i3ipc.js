.pragma library

// Variables to store socket connection state
var i3SocketConnected = false;
var i3SocketProcess = null;

// Function to create a process object if not already created
function getProcessObject() {
    if (!i3SocketProcess) {
        try {
            var component = Qt.createComponent("i3socket_process.qml");
            if (component.status === Component.Ready) {
                i3SocketProcess = component.createObject(null);
                console.log("Process component created successfully");
                return i3SocketProcess;
            } else if (component.status === Component.Error) {
                console.error("Error creating process component:", component.errorString());
            }
        } catch (e) {
            console.error("Exception when creating process:", e);
        }
        return null;
    }
    return i3SocketProcess;
}

// Function to disable i3 shortcuts by creating a special mode with no bindings
function disableI3Shortcuts() {
    // First create an empty i3 mode that doesn't have keyboard shortcut definitions
    var setupModeCommand = 'i3-msg "mode \\"mouseless_training\\""';
    
    var proc = getProcessObject();
    if (proc) {
        proc.startCommand(setupModeCommand);
        i3SocketConnected = true;
        console.log("i3 shortcuts disabled - entered mouseless_training mode");
        return true;
    }
    
    console.error("Failed to disable i3 shortcuts");
    return false;
}

// Function to re-enable i3 shortcuts by returning to default mode
function enableI3Shortcuts() {
    if (i3SocketConnected) {
        // Command to return to default mode
        var command = 'i3-msg "mode default"';
        
        var proc = getProcessObject();
        if (proc) {
            proc.startCommand(command);
            i3SocketConnected = false;
            console.log("i3 shortcuts enabled - returned to default mode");
            return true;
        } else {
            console.error("Cannot find process object to enable i3 shortcuts");
        }
    }
    
    return false;
}

// Function to check if shortcuts are currently disabled
function areShortcutsDisabled() {
    return i3SocketConnected;
}