fx_version 'cerulean'
games { 'gta5' }
author 'https://github.com/MOXHARTZ'
repository 'https://github.com/MOXHARTZ/mx-audioplayer'
discord 'https://discord.gg/crbtDw9hT7'
version '2.7.6'
lua54 'yes'

shared_scripts {
    'shared/*.lua'
}

client_scripts {
    -- copy of ox_lib's callback
    '@mx-surround/client/callback.lua',
    'client/framework/*.lua',
    'client/*.lua',
    'client/addons/*.lua'
}
server_scripts {
    -- copy of ox_lib's callback
    '@mx-surround/server/callback.lua',
    'server/framework/*.lua',
    'server/*.lua'
}

ui_page 'ui/build/index.html'
-- ui_page 'http://localhost:5173/' -- dev

files({
    'locales/*.json',
    'ui/build/index.html',
    'ui/build/**/*',
})

dependencies {
    '/onesync',
    'mx-surround'
}
