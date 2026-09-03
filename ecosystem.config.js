module.exports = {
    apps: [
        {
            name: "classroom-frontend",
            script: "node_modules/next/dist/bin/next",
            args: "start",
            instances: "max",
            exec_mode: "cluster",
            watch: false,
            max_memory_restart: "1024M",
            env: {
                NODE_ENV: "production",
                PORT: 3004,
            },
            node_args: "--max-old-space-size=1024",
            merge_logs: true,
            time: true,
            error_file: "/var/log/classroom-frontend/error.log",
            out_file: "/var/log/classroom-frontend/out.log",
            kill_timeout: 5000,
            autorestart: true,
            restart_delay: 4000,
            max_restarts: 10,
            min_uptime: "10s",
        },
    ],
};
