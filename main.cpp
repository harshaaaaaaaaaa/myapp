#include <QGuiApplication>
#include <QQmlApplicationEngine>
#include <QQmlContext>
#include "i3helper.h"

int main(int argc, char *argv[])
{
#if QT_VERSION < QT_VERSION_CHECK(6, 0, 0)
    QCoreApplication::setAttribute(Qt::AA_EnableHighDpiScaling);
#endif
    QGuiApplication app(argc, argv);

    QQmlApplicationEngine engine;

    // Create and register i3 helper instance
    I3Helper i3helper;
    engine.rootContext()->setContextProperty("I3Helper", &i3helper);

    // Register our singleton
    qmlRegisterSingletonType(QStringLiteral("qrc:/Store.qml"),"Store",1,0,"Store");

    const QUrl url(QStringLiteral("qrc:/main.qml"));
    QObject::connect(
        &engine,
        &QQmlApplicationEngine::objectCreated,
        &app,
        [url](QObject *obj, const QUrl &objUrl) {
            if (!obj && url == objUrl)
                QCoreApplication::exit(-1);
        },
        Qt::QueuedConnection);
    engine.load(url);

    return app.exec();
}
