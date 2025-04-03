#ifndef I3HELPER_H
#define I3HELPER_H

#include <QObject>
#include <QProcess>
#include <QString>
#include <QDebug>

class I3Helper : public QObject
{
    Q_OBJECT

public:
    explicit I3Helper(QObject *parent = nullptr) : QObject(parent) {}

    Q_INVOKABLE bool runCommand(const QString &command, int timeout = -1) {
        QProcess process;
        qDebug() << "Executing i3 command:" << command;
        
        process.start("/bin/sh", QStringList() << "-c" << command);
        if (!process.waitForFinished(timeout)) {
            qDebug() << "Command execution failed or timed out:" << process.errorString();
            return false;
        }
        
        QString output = QString::fromUtf8(process.readAllStandardOutput());
        QString error = QString::fromUtf8(process.readAllStandardError());
        
        if (!output.isEmpty())
            qDebug() << "Output:" << output;
        if (!error.isEmpty())
            qDebug() << "Error:" << error;
            
        return (process.exitCode() == 0);
    }
    
    Q_INVOKABLE QString getCommandOutput(const QString &command, int timeout = -1) {
        QProcess process;
        process.start("/bin/sh", QStringList() << "-c" << command);
        if (!process.waitForFinished(timeout)) {
            qDebug() << "Command execution failed or timed out:" << process.errorString();
            return "";
        }
        
        return QString::fromUtf8(process.readAllStandardOutput());
    }
};

#endif // I3HELPER_H