.pragma library

// Variables to store socket connection state
var i3SocketConnected = false;
var i3SocketProcess = null;

// Function to get or create the process object
function getProcessObject() {
    if (!i3SocketProcess) {
        try {
            var component = Qt.createComponent("i3socket_process.qml");
            if (component.status === Component.Ready) {
                i3SocketProcess = component.createObject(null);
                console.log("Process component created successfully");
            } else if (component.status === Component.Error) {
                console.error("Error creating process component:", component.errorString());
                return null;
            } else {
                console.log("Component status:", component.status);
                return null;
            }
        } catch (e) {
            console.error("Exception when creating process:", e);
            return null;
        }
    }
    return i3SocketProcess;
}

// Function to disable i3 shortcuts by creating a special mode with no bindings
function disableI3Shortcuts() {
    try {
        // First check if i3 is running
        var proc = getProcessObject();
        if (!proc) {
            console.error("Could not create process object");
            return false;
        }

        // Try multiple approaches for better compatibility with different i3 setups
        
        // Approach 1: Try to create a mouseless_training mode on the fly (doesn't require config changes)
        var result = proc.startCommand("i3-msg 'mode mouseless_training'");
        
        if (result) {
            i3SocketConnected = true;
            console.log("i3 shortcuts disabled - entered mouseless_training mode");
            return true;
        }
        
        // Approach 2: Try with double quotes (some i3 configurations need this format)
        result = proc.startCommand("i3-msg \"mode \\\"mouseless_training\\\"\"");
        
        if (result) {
            i3SocketConnected = true;
            console.log("i3 shortcuts disabled - entered mouseless_training mode (approach 2)");
            return true;
        }

        // Approach 3: Create the mode first, then switch to it
        proc.startCommand("i3-msg 'exec i3-msg -t command \"mode mouseless_training\"'");
        i3SocketConnected = true;
        console.log("i3 shortcuts disabled - entered mouseless_training mode (approach 3)");
        return true;
        
    } catch (e) {
        console.error("Error disabling i3 shortcuts:", e);
    }
    
    console.error("Failed to disable i3 shortcuts");
    return false;
}

// Function to re-enable i3 shortcuts by returning to default mode
function enableI3Shortcuts() {
    if (i3SocketConnected) {
        try {
            var proc = getProcessObject();
            if (!proc) {
                console.error("Could not create process object");
                return false;
            }
            
            // Try multiple approaches for better compatibility
            
            // Approach 1: Basic way to return to default mode
            var result = proc.startCommand("i3-msg 'mode default'");
            
            if (result) {
                i3SocketConnected = false;
                console.log("i3 shortcuts enabled - returned to default mode");
                return true;
            }
            
            // Approach 2: Try with double quotes
            result = proc.startCommand("i3-msg \"mode default\"");
            
            if (result) {
                i3SocketConnected = false;
                console.log("i3 shortcuts enabled - returned to default mode (approach 2)");
                return true;
            }
            
            // Approach 3: More direct way
            proc.startCommand("i3-msg mode default");
            i3SocketConnected = false;
            console.log("i3 shortcuts enabled - returned to default mode (approach 3)");
            return true;
            
        } catch (e) {
            console.error("Error enabling i3 shortcuts:", e);
        }
    }
    
    return false;
}

// Function to check if shortcuts are currently disabled
function areShortcutsDisabled() {
    return i3SocketConnected;
}