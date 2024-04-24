package ucmo.senior_project.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.jsonwebtoken.Jwts;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.awt.Color;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Data
@RequiredArgsConstructor
public class GameUser {
    public static long TIMEOUT = 50000; //50 seconds
    private static Map<String, GameUser> gameUsers = Collections.synchronizedMap(new HashMap<>());
    public static int CURRENT_COUNT = 0;

    public static final Color[] PREDEFINED_COLORS = new Color[]{
            Color.RED,
            Color.BLUE,
            Color.ORANGE,
            Color.PINK,
            Color.YELLOW,
            Color.CYAN,
            Color.MAGENTA,
            Color.GREEN,
            Color.LIGHT_GRAY,
    };

    @JsonIgnore
    private GameBroker instance;
    private int instanceId = CURRENT_COUNT++;
    private Integer sourceUser = null;
    private String username;
    private String code;
    private String gameCode;
    private String color;

    private double currentScore = 0;
    private double previousScore = 0;

    public long lastInteraction = 0;

    public GameUser(GameBroker instance, String username, String gameCode) {
        this.instance = instance;
        this.username = username;
        this.gameCode = gameCode;
        this.code = createCode(instance.getCode());
        gameUsers.put(this.code, this);
        this.color = Integer.toHexString(PREDEFINED_COLORS[this.instanceId % PREDEFINED_COLORS.length].getRGB()).substring(2);
    }
    public GameUser(GameBroker instance, AuthUser user, String gameCode) {
        this.instance = instance;
        this.sourceUser = user.getUserId();
        this.username = user.getUsername();
        this.gameCode = gameCode;
        this.code = createCode(instance.getCode());
        gameUsers.put(this.code, this);
        this.color = Integer.toHexString(PREDEFINED_COLORS[this.instanceId % PREDEFINED_COLORS.length].getRGB()).substring(2);
    }
    public static String createCode(String gameCode) {
        UUID u = UUID.randomUUID();
        return Jwts.builder()
                .setId(gameCode + String.valueOf(u.getLeastSignificantBits()) + String.valueOf(u.getMostSignificantBits()))
                .setSubject("login")
                .compact();
    }
    public synchronized boolean isInactive() {
        long lastTime = System.currentTimeMillis();
        if(this.lastInteraction == 0) {
            this.lastInteraction = lastTime;
        }
        long difference = lastTime - this.lastInteraction;
        return difference > TIMEOUT; // 50 seconds.
    }
    public void updateScore(double score) {
        this.previousScore = this.currentScore;
        this.currentScore += score;
    }
    public synchronized void updateLastInteraction() {
        this.lastInteraction = System.currentTimeMillis();
    }
    public synchronized void destroy() {
        gameUsers.remove(this.code);
    }
    public static GameUser fetchGameUser(String code) {
        GameUser found = gameUsers.get(code);
        if (found != null) {
            found.updateLastInteraction();
        }
        return found;
    }

    public int hashCode() {
        return this.code.hashCode();
    }
    public void setColor(String color) {
        this.color = Integer.toHexString(Integer.parseInt(color, 16));
    }
}
