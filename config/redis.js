const redis = require('redis');

let redisClient;

// Docker Compose dosyanla tam uyumlu adres:
// Servis adın 'redis' olduğu için host adresi de 'redis' olur.
const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';

console.log("------------------------------------------");
console.log(`🔌 Redis'e Bağlanılıyor... Hedef: ${REDIS_URL}`);
console.log("------------------------------------------");

redisClient = redis.createClient({
  url: REDIS_URL
});

redisClient.on('error', (err) => console.log('❌ Redis Hatası:', err));
redisClient.on('connect', () => console.log('✅ Redis Bağlantısı Kuruldu (Connect)'));
redisClient.on('ready', () => console.log('⚡ Redis Kullanıma Hazır (Ready)!'));

(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.log('💀 Redis Bağlantı Hatası:', error.message);
  }
})();

module.exports = redisClient;