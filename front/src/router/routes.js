const routes = [
    {
        path: "/",
        component: () => import("../layouts/MainLayout.vue"),
        children: [
            { path: "", component: () => import("../components/home.vue") },

            {
                path: "/view",
                children: [
                    {
                        path: ":game",
                        component: () => import("../components/game.vue"),
                    },
                ],
            },
        ],
    },
    {
        path: "/game",
        component: () => import("../layouts/GameLayout.vue"),
        children: [
            {
                path: ":game/:id/:name",
                component: () => import("../components/dynamicGame.vue"),
            },
        ],
    },
];

export default routes;
