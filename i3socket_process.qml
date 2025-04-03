import QtQuick 2.15
import QtQuick.Controls 2.15

Item {
    id: processItem
    
    Component.onCompleted: {
        console.log("Process handler initialized");
    }
    
    function startCommand(command) {
        console.log("Executing i3 command:", command);
        
        try {
            // Use the C++ I3Helper to execute the command
            var result = I3Helper.runCommand(command);
            console.log("Command execution result:", result);
            return result;
        } catch (e) {
            console.error("Error executing command:", e);
            return false;
        }
    }
    
    // Function to query i3 and return the result
    function runCheckCommand(command) {
        console.log("Running check command:", command);
        
        try {
            // Use the C++ I3Helper to get the command output
            var output = I3Helper.getCommandOutput(command);
            console.log("Command output:", output);
            return output;
        } catch (e) {
            console.error("Error checking command:", e);
            return "";
        }
    }
}