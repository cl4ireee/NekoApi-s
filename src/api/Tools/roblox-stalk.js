const cloudscraper = require("cloudscraper");

async function fetchData(url, method = "GET", payload = null) {
    try {
        const response = method === "POST"
            ? await cloudscraper.post(url, { json: payload })
            : await cloudscraper.get(url);

        return JSON.parse(response);
    } catch (error) {
        return { error: error.message };
    }
}

async function getUserInfo(userId) {
    return fetchData(`https://users.roblox.com/v1/users/${userId}`);
}

async function getUserGroups(userId) {
    return fetchData(`https://groups.roblox.com/v1/users/${userId}/groups/roles`);
}

async function getUserBadges(userId) {
    return fetchData(`https://badges.roblox.com/v1/users/${userId}/badges`);
}

async function getUserGames(userId) {
    return fetchData(`https://games.roblox.com/v2/users/${userId}/games`);
}

async function getUserAvatar(userId) {
    return fetchData(
        `https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=720x720&format=Png&isCircular=false`
    );
}

async function getUsernameHistory(userId) {
    return fetchData(`https://users.roblox.com/v1/users/${userId}/username-history`);
}

async function getUserFriends(userId) {
    return fetchData(`https://friends.roblox.com/v1/users/${userId}/friends`);
}

async function getUserFriendCount(userId) {
    return fetchData(`https://friends.roblox.com/v1/users/${userId}/friends/count`);
}

async function getUserFollowers(userId) {
    return fetchData(`https://friends.roblox.com/v1/users/${userId}/followers`);
}

async function getUserFollowing(userId) {
    return fetchData(`https://friends.roblox.com/v1/users/${userId}/followings`);
}

async function getUserCreatedAssets(userId) {
    return fetchData(`https://catalog.roblox.com/v1/search/items?CreatorId=${userId}&CreatorType=User`);
}

async function robloxStalk(userId) {
    return {
        userInfo: await getUserInfo(userId),
        userGroups: await getUserGroups(userId),
        userBadges: await getUserBadges(userId),
        userGames: await getUserGames(userId),
        userAvatar: await getUserAvatar(userId),
        usernameHistory: await getUsernameHistory(userId),
        userFriends: await getUserFriends(userId),
        userFriendCount: await getUserFriendCount(userId),
        userFollowers: await getUserFollowers(userId),
        userFollowing: await getUserFollowing(userId),
        userCreatedAssets: await getUserCreatedAssets(userId),
    };
}

module.exports = function (app) {
    app.get('/stalk/roblox', async (req, res) => {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ status: false, error: 'Query is required' });
        }

        try {
            if (isNaN(q)) {
                return res.status(400).json({ status: false, error: "Invalid user ID format" });
            }

            const data = await robloxStalk(q);

            res.status(200).json({
                status: true,
                results: data
            });
        } catch (error) {
            console.error("Error fetching Roblox data:", error.message);
            res.status(500).json({ status: false, error: "Failed to fetch Roblox data" });
        }
    });
};
