
using System.Collections.Generic;
using UnityEngine;

public class MazeGameManager : MonoBehaviour
{
    public int width = 21;
    public int height = 21;

    public float wallHeight = 2f;
    public float cellSize = 1f;

    private int[,] maze; // 1 = wall, 0 = path
    private Vector2Int entrance = new Vector2Int(1, 1);
    private Vector2Int exitCell;

    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
    static void InitOnLoad()
    {
        GameObject go = new GameObject("MazeGameManager");
        go.AddComponent<MazeGameManager>();
    }

    void Start()
    {
        if (width % 2 == 0) width += 1;
        if (height % 2 == 0) height += 1;

        exitCell = new Vector2Int(width - 2, height - 2);

        SetupLightingAndGround();
        GenerateMaze();
        BuildMazeVisuals();
        SpawnPlayerAndCamera();
        SpawnPathfindingAgent();
    }

    void SetupLightingAndGround()
    {
        GameObject lightGO = new GameObject("Directional Light");
        var light = lightGO.AddComponent<Light>();
        light.type = LightType.Directional;
        light.color = new Color(0.9f, 0.85f, 0.7f);
        light.intensity = 0.6f;
        lightGO.transform.rotation = Quaternion.Euler(50f, -30f, 0f);

        GameObject ground = GameObject.CreatePrimitive(PrimitiveType.Plane);
        ground.name = "Ground";
        float scaleX = Mathf.Max(width / 10f, 1f);
        float scaleZ = Mathf.Max(height / 10f, 1f);
        ground.transform.localScale = new Vector3(scaleX, 1f, scaleZ);
        var gr = ground.GetComponent<Renderer>();
        gr.material.color = new Color(0.05f, 0.05f, 0.05f);
    }

    void GenerateMaze()
    {
        maze = new int[width, height];

        for (int x = 0; x < width; x++)
        {
            for (int y = 0; y < height; y++)
            {
                maze[x, y] = 1;
            }
        }

        System.Random rng = new System.Random();
        Stack<Vector2Int> stack = new Stack<Vector2Int>();

        Vector2Int start = entrance;
        maze[start.x, start.y] = 0;
        stack.Push(start);

        Vector2Int[] directions = new Vector2Int[] {
            new Vector2Int(2, 0),
            new Vector2Int(-2, 0),
            new Vector2Int(0, 2),
            new Vector2Int(0, -2)
        };

        while (stack.Count > 0)
        {
            Vector2Int current = stack.Pop();

            List<Vector2Int> neighbors = new List<Vector2Int>();
            foreach (var dir in directions)
            {
                Vector2Int n = current + dir;
                if (n.x > 0 && n.x < width - 1 && n.y > 0 && n.y < height - 1)
                {
                    if (maze[n.x, n.y] == 1)
                    {
                        neighbors.Add(n);
                    }
                }
            }

            if (neighbors.Count > 0)
            {
                stack.Push(current);
                Vector2Int chosen = neighbors[rng.Next(neighbors.Count)];
                Vector2Int between = (current + chosen) / 2;
                maze[between.x, between.y] = 0;
                maze[chosen.x, chosen.y] = 0;
                stack.Push(chosen);
            }
        }

        maze[entrance.x, entrance.y] = 0;
        maze[width - 2, height - 2] = 0;
        exitCell = new Vector2Int(width - 2, height - 2);
    }

    void BuildMazeVisuals()
    {
        GameObject parent = new GameObject("Maze");

        Color wallColor = new Color(0.3f, 0.0f, 0.2f);
        Color floorColor = new Color(0.2f, 0.2f, 0.22f);

        for (int x = 0; x < width; x++)
        {
            for (int y = 0; y < height; y++)
            {
                Vector3 pos = new Vector3(x * cellSize, 0f, y * cellSize);

                if (maze[x, y] == 0)
                {
                    GameObject floor = GameObject.CreatePrimitive(PrimitiveType.Cube);
                    floor.name = $"Floor_{x}_{y}";
                    floor.transform.position = pos;
                    floor.transform.localScale = new Vector3(cellSize, 0.1f, cellSize);
                    floor.transform.SetParent(parent.transform);
                    floor.GetComponent<Renderer>().material.color = floorColor;
                }
                else
                {
                    GameObject wall = GameObject.CreatePrimitive(PrimitiveType.Cube);
                    wall.name = $"Wall_{x}_{y}";
                    wall.transform.position = pos + new Vector3(0f, wallHeight / 2f, 0f);
                    wall.transform.localScale = new Vector3(cellSize, wallHeight, cellSize);
                    wall.transform.SetParent(parent.transform);
                    wall.GetComponent<Renderer>().material.color = wallColor;
                }
            }
        }

        Vector3 entrancePos = new Vector3(entrance.x * cellSize, 0.6f, entrance.y * cellSize);
        GameObject entranceMarker = GameObject.CreatePrimitive(PrimitiveType.Cube);
        entranceMarker.name = "EntranceMarker";
        entranceMarker.transform.position = entrancePos;
        entranceMarker.transform.localScale = new Vector3(cellSize * 0.8f, 0.4f, cellSize * 0.8f);
        entranceMarker.GetComponent<Renderer>().material.color = Color.green;
        entranceMarker.transform.SetParent(parent.transform);

        Vector3 exitPos = new Vector3(exitCell.x * cellSize, 0.6f, exitCell.y * cellSize);
        GameObject exitMarker = GameObject.CreatePrimitive(PrimitiveType.Cube);
        exitMarker.name = "ExitMarker";
        exitMarker.transform.position = exitPos;
        exitMarker.transform.localScale = new Vector3(cellSize * 0.8f, 0.4f, cellSize * 0.8f);
        exitMarker.GetComponent<Renderer>().material.color = Color.red;
        exitMarker.transform.SetParent(parent.transform);
    }

    void SpawnPlayerAndCamera()
    {
        Vector3 startPos = new Vector3(entrance.x * cellSize, 0.6f, entrance.y * cellSize);

        GameObject player = GameObject.CreatePrimitive(PrimitiveType.Capsule);
        player.name = "Player";
        player.transform.position = startPos + new Vector3(0f, 0.6f, 0f);
        var rb = player.AddComponent<Rigidbody>();
        rb.constraints = RigidbodyConstraints.FreezeRotationX | RigidbodyConstraints.FreezeRotationZ;

        var controller = player.AddComponent<ThirdPersonController>();
        controller.moveSpeed = 5f;

        GameObject camGO = new GameObject("Main Camera");
        var cam = camGO.AddComponent<Camera>();
        cam.tag = "MainCamera";
        var follow = camGO.AddComponent<CameraFollow>();
        follow.target = player.transform;
        follow.offset = new Vector3(0f, 8f, -8f);
        follow.smoothSpeed = 5f;
        camGO.transform.position = player.transform.position + follow.offset;
        camGO.transform.LookAt(player.transform);
    }

    void SpawnPathfindingAgent()
    {
        List<Vector3> worldPath = FindPathWorld();

        if (worldPath == null || worldPath.Count == 0)
        {
            Debug.LogWarning("No path found for AI agent.");
            return;
        }

        GameObject agent = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        agent.name = "MazeAgent";
        agent.transform.position = worldPath[0] + new Vector3(0f, 0.5f, 0f);
        agent.GetComponent<Renderer>().material.color = new Color(0.8f, 0.8f, 0.2f);

        MazeAgentMover mover = agent.AddComponent<MazeAgentMover>();
        mover.path = worldPath;
        mover.moveSpeed = 3f;
    }

    List<Vector3> FindPathWorld()
    {
        List<Vector2Int> gridPath = AStar(entrance, exitCell);
        if (gridPath == null) return null;

        List<Vector3> worldPath = new List<Vector3>();
        foreach (var cell in gridPath)
        {
            worldPath.Add(new Vector3(cell.x * cellSize, 0.6f, cell.y * cellSize));
        }
        return worldPath;
    }

    class Node
    {
        public Vector2Int pos;
        public float g;
        public float f;
        public Node parent;
    }

    List<Vector2Int> AStar(Vector2Int start, Vector2Int goal)
    {
        var open = new List<Node>();
        var allNodes = new Dictionary<Vector2Int, Node>();

        Node startNode = new Node { pos = start, g = 0f, f = Heuristic(start, goal) };
        open.Add(startNode);
        allNodes[start] = startNode;

        Vector2Int[] dirs = new Vector2Int[] {
            new Vector2Int(1,0),
            new Vector2Int(-1,0),
            new Vector2Int(0,1),
            new Vector2Int(0,-1)
        };

        while (open.Count > 0)
        {
            open.Sort((a, b) => a.f.CompareTo(b.f));
            Node current = open[0];
            open.RemoveAt(0);

            if (current.pos == goal)
            {
                return ReconstructPath(current);
            }

            foreach (var d in dirs)
            {
                Vector2Int nPos = current.pos + d;

                if (nPos.x < 0 || nPos.x >= width || nPos.y < 0 || nPos.y >= height)
                    continue;

                if (maze[nPos.x, nPos.y] == 1)
                    continue;

                float tentativeG = current.g + 1f;

                Node neighbor;
                if (!allNodes.TryGetValue(nPos, out neighbor))
                {
                    neighbor = new Node { pos = nPos };
                    allNodes[nPos] = neighbor;
                }

                if (neighbor.g == 0f && nPos != start)
                {
                    neighbor.g = float.PositiveInfinity;
                }

                if (tentativeG < neighbor.g)
                {
                    neighbor.g = tentativeG;
                    neighbor.f = tentativeG + Heuristic(nPos, goal);
                    neighbor.parent = current;
                    if (!open.Contains(neighbor))
                        open.Add(neighbor);
                }
            }
        }

        return null;
    }

    float Heuristic(Vector2Int a, Vector2Int b)
    {
        return Mathf.Abs(a.x - b.x) + Mathf.Abs(a.y - b.y);
    }

    List<Vector2Int> ReconstructPath(Node node)
    {
        List<Vector2Int> path = new List<Vector2Int>();
        Node current = node;
        while (current != null)
        {
            path.Add(current.pos);
            current = current.parent;
        }
        path.Reverse();
        return path;
    }
}
