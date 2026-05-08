package io.polyglot.langdetect;

import com.cybozu.labs.langdetect.Detector;
import com.cybozu.labs.langdetect.DetectorFactory;
import com.cybozu.labs.langdetect.Language;
import com.google.gson.Gson;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

public final class LangDetectCli {
  private static final Gson GSON = new Gson();

  private LangDetectCli() {}

  public static void main(String[] args) throws Exception {
    if (args.length > 0 && "--version".equals(args[0])) {
      System.out.println("com.cybozu.labs:langdetect:1.1-20120112");
      return;
    }

    String profileDir = System.getenv().getOrDefault("LANGDETECT_PROFILES", "/opt/langdetect/profiles");
    DetectorFactory.loadProfile(profileDir);

    Request request =
        GSON.fromJson(new InputStreamReader(System.in, StandardCharsets.UTF_8), Request.class);
    Response response = new Response();
    response.results = new ArrayList<>();

    if (request != null && request.documents != null) {
      for (String document : request.documents) {
        response.results.add(detect(document == null ? "" : document));
      }
    }

    System.out.println(GSON.toJson(response));
  }

  private static Result detect(String text) throws Exception {
    Detector detector = DetectorFactory.create();
    detector.append(text);
    Result result = new Result();
    List<Language> probabilities = detector.getProbabilities();
    if (probabilities.isEmpty()) {
      result.language = "und";
      result.confidence = 0.0;
      return result;
    }
    Language best = probabilities.get(0);
    result.language = best.lang;
    result.confidence = best.prob;
    return result;
  }

  static final class Request {
    List<String> documents;
  }

  static final class Response {
    List<Result> results;
  }

  static final class Result {
    String language;
    double confidence;
  }
}
